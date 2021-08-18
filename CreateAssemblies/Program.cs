
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace CreateAssemblies
{
    class Program
    {
        static void Main()
        {
            string optionName = "web_browser_homepage";
            string startFile = "/createAsm.html";
            string currentUrl = Directory.GetCurrentDirectory() + startFile;
            //OpenBrowser(currentUrl);
            string path = @"C:\config\pro\config.pro";
            string textOfConfig;

            using (StreamReader config = new StreamReader(path, System.Text.Encoding.Default))
            {
                textOfConfig = config.ReadToEnd();
            }
            if (!textOfConfig.Contains(optionName))
            {
                try
                {
                    //Console.WriteLine(currentUrl);
                    using (StreamWriter additionToConfig = new StreamWriter(path, true, System.Text.Encoding.Default))
                    {
                        additionToConfig.WriteLine(optionName + " " + currentUrl);
                    }

                    //Console.WriteLine("Success");
                }
                catch (System.IO.IOException e)
                {
                    Console.WriteLine(e.Message.ToString());
                }

            }
            else
            {
                string tempFile = Path.GetTempFileName();
                var linesToKeep = File.ReadLines(path).Where(l => !l.Contains(optionName));
                File.WriteAllLines(tempFile, linesToKeep);
                //Console.WriteLine(linesToKeep.FirstOrDefault() + linesToKeep.Count());
                File.Delete(path);
                File.Move(tempFile, path);

                try
                {
                    //Console.WriteLine(currentUrl);
                    using (StreamWriter additionToConfig = new StreamWriter(path, true, System.Text.Encoding.Default))
                    {
                        additionToConfig.WriteLine(optionName + " " + currentUrl);
                    }

                    //Console.WriteLine("Success");
                }
                catch (System.IO.IOException e)
                {
                    Console.WriteLine(e.Message.ToString());
                }


            }

        }

        public static void OpenBrowser(string url)
        {
            try
            {
                Process.Start(url);
            }
            catch
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    url = url.Replace("&", "^&");
                    Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    Process.Start("xdg-open", url);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    Process.Start("open", url);
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
