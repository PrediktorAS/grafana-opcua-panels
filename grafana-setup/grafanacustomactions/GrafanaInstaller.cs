using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration.Install;
using System.IO;
using System.Linq;
using System.ServiceProcess;
using System.Threading.Tasks;

namespace grafanacustomactions
{
	[RunInstaller(true)]
	public partial class GrafanaInstaller : System.Configuration.Install.Installer
	{
		private string[] _nonRemovable = { Path.Combine("opcua", "dbs") };
		public GrafanaInstaller()
		{
			InitializeComponent();
		}

		private System.ServiceProcess.ServiceController GetGrafanaService()
		{
			var services = System.ServiceProcess.ServiceController.GetServices();
			var grafana = services.FirstOrDefault(s => s.ServiceName == "Grafana");
			if (grafana != null)
			{
				return grafana;
			}
			throw new ArgumentException("Grafana could not be found on computer.");
		}



		protected override void OnBeforeInstall(IDictionary savedState)
		{
			base.OnBeforeInstall(savedState);
			var grafanaService = GetGrafanaService();
			var grafanaFolder = grafanaService.GetDirectoryName();
			var targetDir = Context.Parameters["TARGETDIR"];
			if (targetDir != null && targetDir.StartsWith(grafanaFolder))
				throw new ArgumentException("Plugins can not be installed in the grafana folder. The installer will copy the plugins to the correct place. Please select another destination for the plugin files.");
		}


		private bool CanDeleteDirectory(string dir, string[] nonRemovables)
		{
			return !nonRemovables.Any(nr => nr.StartsWith(dir));
		}

		private bool CanDeleteContent(string dir, string[] nonRemovables)
		{
			return !nonRemovables.Any(nr => dir.StartsWith(nr));
		}



		private void CopyPlugins(StreamWriter log, ServiceController grafanaService, string targetDir)
		{
			var grafanaFolder = grafanaService.GetDirectoryName();
			log.WriteLine("Grafana location: " + grafanaFolder);
			var destination = System.IO.Path.Combine(grafanaFolder, "grafana", "data", "plugins");
			log.WriteLine("Plugin destination: " + destination);
			var nonRemovablePaths = _nonRemovable.Select(a => Path.Combine(destination, a)).ToArray();
			var pluginFolders = System.IO.Directory.EnumerateDirectories(targetDir).ToArray();
			foreach (var folder in pluginFolders)
			{
				var plugin = Path.GetFileName(folder.TrimEnd(Path.DirectorySeparatorChar));
				var destinationPath = Path.Combine(destination, plugin);
				
				FileSystem.DeleteDirectory(destinationPath, 
					(dir) => CanDeleteDirectory(dir, nonRemovablePaths),
					(dir) => CanDeleteContent(dir, nonRemovablePaths),
					log);
				log.WriteLine("Copying plugin: " + plugin + " to folder: " + destinationPath);
				FileSystem.CopyDirectory(folder, destinationPath, true, true);
			}
		}

		protected override void OnAfterInstall(IDictionary savedState)
		{
			base.OnAfterInstall(savedState);
			using (var log = System.IO.File.CreateText(Path.Combine(Path.GetTempPath(), "grafana-install-log.txt")))
			{
				try
				{
					var targetDir = Context.Parameters["TARGETDIR"];
					log.WriteLine("Target Dir: " + targetDir);
					if (!string.IsNullOrEmpty(targetDir))
					{
						var grafanaService = GetGrafanaService();
						bool start = false;
						if (grafanaService.Status != System.ServiceProcess.ServiceControllerStatus.Stopped)
						{
							start = true;
							log.WriteLine("Stopping grafana service");
							grafanaService.Stop();
						}
						grafanaService.WaitForStatus(System.ServiceProcess.ServiceControllerStatus.Stopped, TimeSpan.FromMinutes(2));
						log.WriteLine("Grafana service - stopped");
						try
						{
							CopyPlugins(log, grafanaService, targetDir);
						}
						finally
						{
							if (start)
							{
								log.WriteLine("Starting grafana service");
								grafanaService.Start();
							}
						}
					}
					else
					{
						log.WriteLine("Could not find [TARGETDIR]");
						Context.LogMessage("Could not find [TARGETDIR]");
					}
				}
				catch (Exception e)
				{
					log.WriteLine("Exception: " + e.ToString());
					Context.LogMessage("Exception: " + e.ToString());
				}
			}

		}
	}

}
