using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration.Install;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace grafanacustomactions
{
	[RunInstaller(true)]
	public partial class GrafanaInstaller : System.Configuration.Install.Installer
	{

		public GrafanaInstaller()
		{
			InitializeComponent();
		}

        private string GetGrafanaFolder(StreamWriter sw)
		{
			var services = System.ServiceProcess.ServiceController.GetServices();
			var grafana = services.FirstOrDefault(s => s.ServiceName == "Grafana");
			if (grafana != null)
			{
				var imagePath = grafana.GetImagePath();
				sw.WriteLine("ImagePath: " + imagePath);
				return Path.GetDirectoryName(imagePath);
			}
			throw new ArgumentException("Grafana could not be found on computer.");
		}


		protected override void OnAfterInstall(IDictionary savedState)
		{
			base.OnAfterInstall(savedState);
			using (var sw = System.IO.File.CreateText("c:\\temp\\install.txt"))
			{

				try
				{
					var targetDir = Context.Parameters["TARGETDIR"];
					sw.WriteLine("Target Dir: " + targetDir);
					if (!string.IsNullOrEmpty(targetDir))
					{
						//C:\Program Files\GrafanaLabs
						var grafanaFolder = GetGrafanaFolder(sw);
						sw.WriteLine("Grafana: " + grafanaFolder);

						var destination = System.IO.Path.Combine(grafanaFolder, "grafana", "data", "plugins");
						//var dirInfo = System.IO.Directory.CreateDirectory(destination);
						sw.WriteLine("Destination: " + destination);
						var pluginFolders = System.IO.Directory.EnumerateDirectories(targetDir).ToArray();
						foreach (var folder in pluginFolders)
						{
							var plugin = Path.GetFileName(folder.TrimEnd(Path.DirectorySeparatorChar));
							sw.WriteLine("Plugin: " + plugin);
							FileSystem.CopyDirectory(folder, Path.Combine(destination, plugin), true, true);
						}
					}
					else
						Context.LogMessage("Could not find [TARGETDIR]");
				}
				catch (Exception e)
				{
					sw.WriteLine("Exception: " + e.ToString());
					Context.LogMessage("Exception: " + e.ToString());
				}
			}

		}





		protected override void OnCommitted(IDictionary savedState)
		{
			base.OnCommitted(savedState);

		}

	}

}
