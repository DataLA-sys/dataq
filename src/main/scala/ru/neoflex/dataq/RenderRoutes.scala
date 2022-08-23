package ru.neoflex.dataq

import akka.actor.typed.{ActorRef, ActorSystem}
import akka.actor.typed.scaladsl.AskPattern._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.StatusCodes.{InternalServerError, PermanentRedirect}
import akka.http.scaladsl.model.{HttpResponse, StatusCodes}
import akka.http.scaladsl.model.headers.{`Access-Control-Allow-Credentials`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Origin`}
import akka.http.scaladsl.server.Directives.{complete, _}
import akka.http.scaladsl.server.directives.Credentials
import akka.http.scaladsl.server.{Directive0, ExceptionHandler, Route}
import akka.pattern.StatusReply
import akka.util.Timeout
import org.json4s.DefaultFormats
import ru.neoflex.dataq.actors.EntityActor.{CompleteEntityMessage, CompleteMessage, Copy, Delete, FileContent, FileContentMessage, FileCreateCommand, FileDeleteCommand, FileListCommand, FileListMessage, FileOpts, FileSaveCommand, GetEntityCommand, SaveCommand}
import ru.neoflex.dataq.actors.SystemUtilActor.{CommandOutResult, GetOutCommand, RunCommand, RunCommandNoWait, RunCommandResult, SystemCommandResultMessage}
import ru.neoflex.dataq.actors.{EntityActor, SourceFilesActor, SystemUtilActor}

import scala.concurrent.{ExecutionContextExecutor, Future}
import spray.json.DefaultJsonProtocol._
import spray.json.RootJsonFormat

import java.io.File
import java.net.URLDecoder
import scala.util.Success

trait CORSHandler{

  private val corsResponseHeaders = List(
    `Access-Control-Allow-Origin`.*,
    `Access-Control-Allow-Credentials`(true),
    `Access-Control-Allow-Headers`("Authorization",
      "Content-Type", "X-Requested-With")
  )

  //this directive adds access control headers to normal responses
  private def addAccessControlHeaders: Directive0 = {
    respondWithHeaders(corsResponseHeaders)
  }

  //this handles preflight OPTIONS requests.
  private def preflightRequestHandler: Route = options {
    complete(HttpResponse(StatusCodes.OK).
      withHeaders(`Access-Control-Allow-Methods`(OPTIONS, POST, PUT, GET, DELETE)))
  }

  // Wrap the Route with this method to enable adding of CORS headers
  def corsHandler(r: Route): Route = addAccessControlHeaders {
    preflightRequestHandler ~ r
  }

  // Helper method to add CORS headers to HttpResponse
  // preventing duplication of CORS headers across code
  def addCORSHeaders(response: HttpResponse):HttpResponse =
    response.withHeaders(corsResponseHeaders)

}

class RenderRoutes(sourceFilesActor: ActorRef[SourceFilesActor.FileCommand],
                   entityActor: ActorRef[EntityActor.EntityCommand],
                   systemUtilActor: ActorRef[SystemUtilActor.SystemCommand])
                  (implicit val system: ActorSystem[_]) extends CORSHandler  {

  import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  private implicit val timeout: Timeout = Timeout.create(system.settings.config.getDuration("my-app.routes.ask-timeout"))
  implicit val ec: ExecutionContextExecutor = system.executionContext

  implicit val formats: DefaultFormats.type = DefaultFormats
  private val projectsDir = system.settings.config.getString("my-app.system.quarryProjects")
  private val sparkSubmit = system.settings.config.getString("my-app.spark.sparkSubmit")

  def assets: Route = {
    def redirectSingleSlash =
      pathSingleSlash {
        get {
          redirect("index.html", PermanentRedirect)
        }
      }
    getFromResourceDirectory("web") ~ redirectSingleSlash
  }

  implicit def exceptionHandler: ExceptionHandler =
    ExceptionHandler {
      case e: Throwable =>
        extractUri { uri =>
          system.log.error(s"Request to $uri could not be handled normally", e)
          complete(HttpResponse(InternalServerError, entity = e.getMessage))
        }
    }

  def myUserPassAuthenticator(credentials: Credentials): Option[String] =
    credentials match {
      case p @ Credentials.Provided(id) if p.verify("admin") => Some(id)
      case _ => None
    }
  case class User(username: String, password: String)
  implicit val jobFormat: RootJsonFormat[User] = jsonFormat2(User)
  def renderRoutes(): Route = Route.seal({
    concat(
      get {
        authenticateBasic(realm = "secure site", myUserPassAuthenticator) { user =>
          concat(
            path("projects") {
              complete(new File(projectsDir).listFiles().filter(_.isDirectory).map(_.getName).toList)
            },
            path("getEntity") {
              parameters("project".as[String]) { project => {
                onComplete(entityActor
                  .askWithStatus(GetEntityCommand(URLDecoder.decode(project, "UTF8"), _: ActorRef[StatusReply[CompleteEntityMessage]]))) {
                  case Success(EntityActor.FileContentMessage(value)) => complete(value)
                }
              }
              }
            },
            path("getFile") {
              parameters("project".as[String], "file".as[String]) { (project, file) => {
                onComplete(entityActor
                  .askWithStatus(FileContent(URLDecoder.decode(project, "UTF8"), file, _: ActorRef[StatusReply[FileContentMessage]]))) {
                  case Success(EntityActor.FileContentMessage(value)) => complete(value)
                }
              }
              }
            },
            path("getListFiles") {
              parameters("project".as[String]) { (project) => {
                onComplete(entityActor
                  .askWithStatus(FileListCommand(URLDecoder.decode(project, "UTF8"), _: ActorRef[StatusReply[FileListMessage]]))) {
                  case Success(EntityActor.FileListMessage(value)) => complete(value)
                }
              }
              }
            },
            path("options") {
              onComplete(entityActor
                .askWithStatus(FileOpts(_: ActorRef[StatusReply[FileContentMessage]]))) {
                case Success(EntityActor.FileContentMessage(value)) => complete(value)
              }
            },
            path("runit") {
              parameters("sh".as[String], "nowait".withDefault(false)) { (sh, nowait) =>
                system.log.info("run: " + sh)
                if(nowait) complete(
                  systemUtilActor
                    .ask(RunCommandNoWait(sh, _: ActorRef[SystemCommandResultMessage]))
                    .map{
                      case RunCommandResult(value, _) => Future(value)
                    }) else complete(
                  systemUtilActor
                    .ask(RunCommand(sh, _: ActorRef[SystemCommandResultMessage]))
                    .map {
                      case RunCommandResult(value, _) => Future(value)
                    })
              }
            },
            path("sysout") {
              parameters("runid".as[String]) { runId =>
                complete(
                  systemUtilActor
                    .ask(GetOutCommand(runId, _: ActorRef[SystemCommandResultMessage]))
                    .map {
                      case CommandOutResult(commandId, stdOut, _) =>
                        Future(stdOut)
                    })
              }
            },
            path("settings") {
              val s = new File(projectsDir).getCanonicalPath
              complete(
                s"""
                   |{
                   |  "sparkSubmit": "$sparkSubmit",
                   |  "projects": "$s"
                   |}
                   |""".stripMargin)
            },
            path("hello") {
              complete("Hello! I am alive!")
            }
          )
        }
      },
      post {
        path("user") {
            entity(as[User]) { user =>
              complete("{\"id\": 1,\"username\": \"admin\", \"password\": \"admin\"}")
            }
        }
      },
      post {
        authenticateBasic(realm = "secure site", myUserPassAuthenticator) { user =>
          concat(
            path("save") {
              entity(as[String]) { body =>
                onComplete(entityActor
                  .askWithStatus(SaveCommand(body, _: ActorRef[StatusReply[CompleteEntityMessage]]))) {
                  case Success(CompleteMessage()) => complete(Future("Saved!"))
                }
              }
            },
            path("createFile") {
              parameters("project".as[String], "file".as[String]) { (project, file) =>
                onComplete(entityActor
                  .askWithStatus(FileCreateCommand(project, file, _: ActorRef[StatusReply[CompleteEntityMessage]]))) {
                  case Success(CompleteMessage()) => complete("Created!")
                }
              }
            },
            path("deleteFile") {
              parameters("project".as[String], "file".as[String]) { (project, file) =>
                onComplete(entityActor
                  .askWithStatus(FileDeleteCommand(project, file, _: ActorRef[StatusReply[CompleteEntityMessage]]))) {
                  case Success(CompleteMessage()) => complete("Deleted!")
                }
              }
            },
            path("saveFile") {
              parameters("project".as[String], "file".as[String]) { (project, file) =>
                entity(as[String]) { body =>
                  onComplete(entityActor
                    .askWithStatus(FileSaveCommand(project, file, body, _: ActorRef[StatusReply[CompleteEntityMessage]]))) {
                    case Success(CompleteMessage()) => complete("Saved!")
                  }
                }
              }
            },
            path("copyProject") {
              parameters("source".as[String], "target".as[String]) { (source, target) =>
                onComplete(entityActor
                  .askWithStatus(Copy(source, target, _: ActorRef[StatusReply[CompleteMessage]]))) {
                  case Success(CompleteMessage()) => complete("Copied!")
                }
              }
            },
            path("deleteProject") {
              parameters("name".as[String]) { (name) =>
                onComplete(entityActor
                  .askWithStatus(Delete(name, _: ActorRef[StatusReply[CompleteMessage]]))) {
                  case Success(CompleteMessage()) => complete("Deleted!")
                }
              }
            }
          )
        }
      },
      assets
    )
  })
}
