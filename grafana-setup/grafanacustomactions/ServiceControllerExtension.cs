using Microsoft.Win32;
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

	public static class ServiceControllerExtensions
	{

        private static string GetImagePath(string serviceName)
        {
            string registryPath = @"SYSTEM\CurrentControlSet\Services\Grafana\Parameters";
            RegistryKey keyHKLM = Registry.LocalMachine;

            RegistryKey key = keyHKLM.OpenSubKey(registryPath);
            

            string value = key.GetValue("AppDirectory").ToString();
            key.Close();
            var s = Environment.ExpandEnvironmentVariables(value);
            char[] c = {'"'};
            return s.Trim(c);
        }

        
        public static string GetImagePath(this ServiceController sc)
		{
			return GetImagePath(sc.ServiceName);
		}

        public static string GetDirectoryName(this ServiceController sc)
        {
            var imagePath = GetImagePath(sc.ServiceName);
            return Path.GetDirectoryName(imagePath);
        }
    }
}

