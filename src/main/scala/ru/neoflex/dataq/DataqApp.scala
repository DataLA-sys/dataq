package ru.neoflex.dataq

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import ru.neoflex.dataq.actors.{EntityActor, SourceFilesActor}

import scala.util.Failure
import scala.util.Success

//#main-class
object DataqApp {
  //#start-http-server
  private def startHttpServer(routes: Route)(implicit system: ActorSystem[_]): Unit = {
    // Akka HTTP still needs a classic ActorSystem to start
    import system.executionContext
    val hostPort = system.settings.config.getInt("my-app.system.port")

    val futureBinding = Http().newServerAt("0.0.0.0", hostPort).bind(routes)
    futureBinding.onComplete {
      case Success(binding) =>
        val address = binding.localAddress
        system.log.info("Server online at http://{}:{}/", address.getHostString, address.getPort)
      case Failure(ex) =>
        system.log.error("Failed to bind HTTP endpoint, terminating system", ex)
        system.terminate()
    }
  }
  //#start-http-server

  def main(args: Array[String]): Unit = {
      val rootBehavior = Behaviors.setup[Nothing] { context =>
        val projectsFileName = {
          if(args.length > 0) {
            args(0)
          } else ""
        }

        val filesActor = context.spawn(SourceFilesActor(), "SourceFilesActor")
        val entityActor = context.spawn(EntityActor(), "EntityActorActor")

        val routes = new RenderRoutes(filesActor, entityActor)(context.system)
        startHttpServer(routes.renderRoutes())(context.system)

        Behaviors.empty
    }
    val system = ActorSystem[Nothing](rootBehavior, "DataQuarryAkkaHttpServer")
  }
}
//#main-class
