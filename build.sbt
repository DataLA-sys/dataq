import scala.sys.process._

lazy val akkaHttpVersion = "10.2.4"
lazy val akkaVersion    = "2.6.14"
//lazy val sparkVersion = "3.1.2"

assemblyMergeStrategy in assembly := {
	case PathList("META-INF", xs @ _*) => MergeStrategy.discard
	case PathList("reference.conf") => MergeStrategy.concat
	case x => MergeStrategy.last
}

lazy val execNpmBuildScript = taskKey[Unit]("Build UI project")

execNpmBuildScript := {
  System.getProperty("os.name").toLowerCase match {
    case win if win.contains("win") => "buildui.bat" !
    case linux if linux.contains("linux") => "./buildui.sh" !
    case osName => throw new RuntimeException(s"Unknown operating system $osName")
  }
//"buildui.bat" !
}

lazy val root = (project in file(".")).
  settings(
    inThisBuild(List(
      organization    := "com.example",
      scalaVersion    := "2.12.4"
    )),
    name := "dataquote",
    libraryDependencies ++= Seq(
      "com.typesafe.akka" %% "akka-http"                % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-spray-json"     % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-actor-typed"         % akkaVersion,
      "com.typesafe.akka" %% "akka-stream"              % akkaVersion,
      "ch.qos.logback"    % "logback-classic"           % "1.2.5",
      //"org.scalatra.scalate" %% "scalate-core" % "1.9.6",
      "org.json4s" %% "json4s-jackson" % "3.6.11",
      //"org.json4s" %% "json4s-jackson" % "4.0.3",
      //"org.apache.spark" %% "spark-catalyst" % "3.1.2",

      "com.typesafe.akka" %% "akka-http-testkit"        % akkaHttpVersion % Test,
      "com.typesafe.akka" %% "akka-actor-testkit-typed" % akkaVersion     % Test,
      "org.scalatest"     %% "scalatest"                % "3.1.4"         % Test
    )
  )
  lazy val logback = "ch.qos.logback" % "logback-classic" % "1.2.5"

(compile in Compile) := ((compile in Compile) dependsOn execNpmBuildScript).value