package ru.neoflex.dataq.actors

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior, SupervisorStrategy}
import akka.util.Timeout
import org.json4s._

import java.io.{BufferedReader, InputStreamReader}
import java.util.Calendar
import scala.collection.mutable.ListBuffer
import scala.concurrent.duration.DurationInt
import scala.concurrent.{Future, blocking}
import scala.util.Failure

object SystemUtilRunnerActor {
  def apply(configFile: String): Behavior[SystemRunnerCommand] = Behaviors.supervise(render).onFailure(SupervisorStrategy.restart)
  var commandsOutput = Map[String, (String, ListBuffer[String])]()

  implicit val formats = DefaultFormats
  sealed trait SystemRunnerCommand
  case class RunCommand(shCommand: String, runId: String) extends SystemRunnerCommand
  case class GetOutCommand(commandRunId: String, replyTo: ActorRef[SystemRunnerResultMessage]) extends SystemRunnerCommand
  sealed trait SystemRunnerResultMessage
  case class CommandOutResult(commandRunId: String, stdOut: String) extends SystemRunnerResultMessage

  def runSh(runId: String, shCommand: String, system: ActorSystem[Nothing]): String = {
    system.log.info("runner: " + shCommand)
    implicit val ex = system.executionContext

    Future {
      blocking {
          val p = new ProcessBuilder(shCommand.split(' ').toArray:_*)
          val strBuffer = new ListBuffer[String]()
          strBuffer += Calendar.getInstance.getTime.toString
          strBuffer += "Start: " + shCommand
          val br = new BufferedReader(new InputStreamReader(p.start().getInputStream()))
          commandsOutput += (runId -> (shCommand, strBuffer))

          var line: String = ""
          while ( {
            line = br.readLine();
            line != null
          }) {
            strBuffer += line
          }
          br.close()
          strBuffer += Calendar.getInstance.getTime.toString
          strBuffer += "Finish: " + shCommand
      }
    } onComplete {
      case Failure(e) =>
            val strBuffer = new ListBuffer[String]()
            strBuffer += e.getMessage
            strBuffer ++= e.getStackTrace.toList.map(l=>l.toString)
            system.log.error(strBuffer.mkString("\n"))
            commandsOutput += (runId -> (shCommand, strBuffer))
      case _ =>
    }

    runId
  }

  val render: Behavior[SystemRunnerCommand] = Behaviors.receive { (context, message) => {
      implicit val timeout: Timeout = 190.seconds
      message match {
        case RunCommand(runId: String, shCommand: String) => {
          runSh(runId, shCommand, context.system)
          Behaviors.same
        }
        case GetOutCommand(commandRunId, replyTo) => {
          commandsOutput.get(commandRunId).map(o => replyTo ! CommandOutResult(commandRunId, o._2.mkString("\r\n")))
          Behaviors.same
        }
      }
    }
  }
}
