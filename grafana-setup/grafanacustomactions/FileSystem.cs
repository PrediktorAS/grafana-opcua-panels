using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace grafanacustomactions
{
	public class FileSystem
	{

        /// <summary>
        /// Copies a directory with its files, including sub-dirs if desired.
        /// </summary>
        /// <param name="sourceDirName">The source directory to copy</param>
        /// <param name="destDirName">The full path of the destination direcory</param>
        /// <param name="copySubDirs">If true, subdirs and their files are also copied.</param>
        /// <param name="overWrite">If true, existing files will be overwritten</param>
        public static void CopyDirectory(string sourceDirName, string destDirName, bool copySubDirs, bool overWrite = false)
        {
            // Get the subdirectories for the specified directory.
            DirectoryInfo dir = new DirectoryInfo(sourceDirName);

            if (!dir.Exists)
            {
                throw new DirectoryNotFoundException(
                    "Source directory does not exist or could not be found: "
                    + sourceDirName);
            }

            DirectoryInfo[] dirs = dir.GetDirectories();
            // If the destination directory doesn't exist, create it.
            if (!Directory.Exists(destDirName))
            {
                Directory.CreateDirectory(destDirName);
            }

            // Get the files in the directory and copy them to the new location.
            FileInfo[] files = dir.GetFiles();
            foreach (FileInfo file in files)
            {
                string temppath = Path.Combine(destDirName, file.Name);
                file.CopyTo(temppath, overWrite);
            }

            // If copying subdirectories, copy them and their contents to new location.
            if (copySubDirs)
            {
                foreach (DirectoryInfo subdir in dirs)
                {
                    string temppath = Path.Combine(destDirName, subdir.Name);
                    CopyDirectory(subdir.FullName, temppath, copySubDirs, overWrite);
                }
            }
        }

        public static void DeleteDirectory(string dir, Func<string, bool> shallDelete, Func<string, bool> shallDeleteContent, StreamWriter log)
		{
            if (Directory.Exists(dir))
            {
                if (shallDelete == null)
                {
                    log.WriteLine("Deleting directory: " + dir);
                    Directory.Delete(dir, true);
                }
                else
                {
                    if (shallDelete(dir))
                    {
                        log.WriteLine("Deleting directory: " + dir);
                        Directory.Delete(dir, true);
                    }
                    else
                    {
                        if (shallDeleteContent(dir))
                        {
                            var files = Directory.GetFiles(dir);
                            for (int i = 0; i < files.Length; i++)
                                File.Delete(files[i]);
                        }

                        var dirs = Directory.EnumerateDirectories(dir).ToArray();
                        for (int i = 0; i < dirs.Length; i++)
                        {
                            DeleteDirectory(dirs[i], shallDelete, shallDeleteContent, log);
                        }
                    }
                }
            }
		}
    }
}
