using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration.Install;
using System.Linq;

namespace grafanainstaller
{
	[RunInstaller(true)]
	public partial class GrafanaInstaller : System.Configuration.Install.Installer
	{
		public GrafanaInstaller()
		{
			InitializeComponent();
		}

		protected override void OnCommitted(IDictionary savedState)
		{
			base.OnCommitted(savedState);
			var targetDir = Context.Parameters["TARGETDIR"];
			if (!string.IsNullOrEmpty(targetDir))
			{
				var pluginFolders = System.IO.Directory.EnumerateDirectories(targetDir).ToArray();

			}
			else
				Context.LogMessage("Could not find [TARGETDIR]");
		}
	}
}
