package ru.neoflex.dataq.actors

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior, SupervisorStrategy}
import akka.pattern.StatusReply
import org.json4s._
import org.json4s.jackson.JsonMethods

import java.io.{File, PrintWriter}
import java.nio.file.Path
import scala.io.Source.fromFile

object EntityActor {
  def apply(): Behavior[EntityCommand] = Behaviors.supervise(process).onFailure(SupervisorStrategy.restart)
  private var projectsDir: String = ""
  private var optsDescriptions: String = ""
  trait EntityCommand
  case class GetEntityCommand(project: String, replyTo: ActorRef[StatusReply[FileContentMessage]]) extends EntityCommand
  case class SaveCommand(body: String, replyTo: ActorRef[StatusReply[CompleteEntityMessage]]) extends EntityCommand
  case class FileListCommand(quarryProjectName: String, replyTo: ActorRef[StatusReply[FileListMessage]]) extends EntityCommand
  case class FileCreateCommand(project: String, file: String, replyTo: ActorRef[StatusReply[CompleteEntityMessage]]) extends EntityCommand
  case class FileDeleteCommand(project: String, file: String, replyTo: ActorRef[StatusReply[CompleteEntityMessage]]) extends EntityCommand
  case class FileSaveCommand(project: String, file: String, body: String, replyTo: ActorRef[StatusReply[CompleteEntityMessage]]) extends EntityCommand
  case class FileContent(project: String, file: String, replyTo: ActorRef[StatusReply[FileContentMessage]]) extends EntityCommand
  case class FileOpts(replyTo: ActorRef[StatusReply[FileContentMessage]]) extends EntityCommand
  case class Copy(source: String, target: String, replyTo: ActorRef[StatusReply[CompleteMessage]]) extends EntityCommand
  case class Delete(name: String, replyTo: ActorRef[StatusReply[CompleteMessage]]) extends EntityCommand
  trait CompleteEntityMessage
  case class CompleteMessage() extends CompleteEntityMessage
  case class FileListMessage(list: List[String]) extends CompleteEntityMessage
  case class FileContentMessage(content: String) extends CompleteEntityMessage

  implicit val formats: DefaultFormats = DefaultFormats

  def save(body: String): Unit = {
    val dir = new File(this.projectsDir)
    if(!dir.exists()) {
      dir.mkdir()
    }
    val jBody = JsonMethods.parse(body)
    val name = (jBody \ "name").extract[String]
    if(name == "") {
      throw new IllegalArgumentException("Name empty!")
    }
    val projectsDir = new File(this.projectsDir + "/" + name)
    val scriptsDir = new File(this.projectsDir + "/" + name + "/" + "scripts")
    if(!projectsDir.exists()) {
      projectsDir.mkdir()
    }
    if(!scriptsDir.exists()) {
      scriptsDir.mkdir()
    }
    new PrintWriter(this.projectsDir + "/" + name + "/" + name + ".json") { write(body); close() }
  }

  def createFile(project: String, file: String): Unit = {
    /*val scriptsDir = new File(this.projectsDir + "/" + project + "/" + "scripts")
    if(!scriptsDir.exists()) {
      scriptsDir.mkdir()
    }*/
    new File(this.projectsDir + "/" + project + "/scripts/" + file).createNewFile()
  }

  def saveFile(project: String, file: String, body: String): Unit = {
    new PrintWriter(this.projectsDir + "/" + project + "/scripts/" + file) { write(body); close() }
  }

  def getFileText(fileName: String): String = {
    if(new File(fileName).exists() == false) {
      new File(fileName).createNewFile()
    }
    val source = fromFile(fileName)
    try {
      source.mkString
    } finally {
      source.close()
    }
  }

  val process: Behavior[EntityCommand] = Behaviors.receive { (context, message) =>
    projectsDir = context.system.settings.config.getString("my-app.system.quarryProjects")
    optsDescriptions = context.system.settings.config.getString("my-app.system.optsFile")
    message match {
      case message: GetEntityCommand =>
        try {
          message.replyTo ! StatusReply.success(FileContentMessage(getFileText(projectsDir + "/" + message.project + "/" + message.project + ".json")))
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: SaveCommand =>
        try {
          save(message.body)
          message.replyTo ! StatusReply.success(CompleteMessage())
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: FileListCommand =>
        try {
          if (new File(this.projectsDir + "/" + message.quarryProjectName + "/" + "scripts").exists() == false) {
            message.replyTo ! StatusReply.success(FileListMessage(List[String]()))
          } else {
            val files = new File(this.projectsDir + "/" + message.quarryProjectName + "/" + "scripts")
              .listFiles()
              .map(f => f.getName)
            message.replyTo ! StatusReply.success(FileListMessage(files.toList))
          }

        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: FileCreateCommand =>
        try {
          createFile(message.project, message.file)
          message.replyTo ! StatusReply.success(CompleteMessage())
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: FileSaveCommand =>
        try {
          saveFile(message.project, message.file, message.body)
          message.replyTo ! StatusReply.success(CompleteMessage())
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: FileDeleteCommand =>
        try {
          new File(projectsDir + "/" + message.project + "/scripts/" + message.file).delete()
          message.replyTo ! StatusReply.success(CompleteMessage())
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: FileContent =>
        try {
          message.replyTo ! StatusReply.success(FileContentMessage(
            getFileText(projectsDir + "/" + message.project + "/scripts/" + message.file)))
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: FileOpts =>
        try {
          message.replyTo ! StatusReply.success(FileContentMessage(
            getFileText(optsDescriptions)))
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: Copy =>
        try {
          val source = new File(projectsDir + "/" + message.source)
          val target = new File(projectsDir + "/" + message.target)
          if(!source.isDirectory) {
            throw new Throwable("Source wrong!")
          }
          if(target.exists()) {
            throw new Throwable("Target exist!")
          }

          import java.nio.file.Files.copy
          import java.nio.file.StandardCopyOption.REPLACE_EXISTING
          def copyFile(sourceFile: File, destinationFile: File): Unit = {
            copy(sourceFile.toPath, destinationFile.toPath, REPLACE_EXISTING)
          }
          def copyDirectoryCompatibityMode(source: File, destination: File): Unit = {
            if (source.isDirectory) copyDirectory(source, destination)
            else copyFile(source, destination)
          }
          def copyDirectory(sourceDirectory: File, destinationDirectory: File): Unit = {
            if (!destinationDirectory.exists) destinationDirectory.mkdir
            for (f <- sourceDirectory.list) {
              copyDirectoryCompatibityMode(new File(sourceDirectory, f), new File(destinationDirectory, f))
            }
          }
          copyDirectory(source, target)
          val a = new File(projectsDir + "/" + message.target + "/" + message.source + ".json")
          val b = new File(projectsDir + "/" + message.target + "/" + message.target + ".json")

          copyFile(a, b)
          a.delete()

          val sourcefile = fromFile(b)
          val s = sourcefile.getLines.mkString("\r\n")
          sourcefile.close()
          new PrintWriter(this.projectsDir + "/" + message.target + "/" + message.target + ".json") {
            write(s.replace(": \"" + message.source + "\"", ": \"" + message.target + "\""));
            close()
          }

          message.replyTo ! StatusReply.success(CompleteMessage())
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
      case message: Delete =>
        try {
          import java.nio.file.DirectoryStream
          import java.nio.file.Files
          import java.nio.file.LinkOption

          def deleteDirectoryRecursion(path: Path): Unit = {
            if (Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS)) try {
              val entries: DirectoryStream[Path] = Files.newDirectoryStream(path)
              val e = entries.iterator()
              try {
                while(e.hasNext) {
                  val entry = e.next()
                  deleteDirectoryRecursion(entry)
                }
              }
              finally
              {
                if (entries != null) entries.close()
              }
            }
            Files.delete(path)
          }
          val d = new File(projectsDir + "/" + message.name)
          deleteDirectoryRecursion(d.toPath)

          message.replyTo ! StatusReply.success(CompleteMessage())
        } catch {
          case e: Throwable => message.replyTo ! StatusReply.error(e)
        }
        Behaviors.same
    }
  }
}
