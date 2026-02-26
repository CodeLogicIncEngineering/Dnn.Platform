// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
// See the LICENSE file in the project root for more information

namespace DotNetNuke.Build;

using System;
using System.Diagnostics;
using System.IO;

using Cake.Common.IO;
using Cake.Core.IO;

/// <summary>Provides extensions to <see cref="Context"/>.</summary>
public static class ContextExtensions
{
    /// <summary>Gets the path to Visual Studio MSBuild (required for SDK-style and web projects). Returns null if not found.</summary>
    /// <param name="context">The cake context (unused; for consistency with other extensions).</param>
    /// <returns>The path to MSBuild.exe, or null.</returns>
    public static string GetMsBuildPath(this Context context)
    {
        var programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
        var vswhere = System.IO.Path.Combine(programFilesX86, "Microsoft Visual Studio", "Installer", "vswhere.exe");
        if (!File.Exists(vswhere))
        {
            return null;
        }

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = vswhere,
                Arguments = "-latest -requires Microsoft.Component.MSBuild -find MSBuild\\**\\Bin\\MSBuild.exe -format value",
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };
            using var process = Process.Start(startInfo);
            if (process == null)
            {
                return null;
            }

            var output = process.StandardOutput.ReadToEnd();
            process.WaitForExit(TimeSpan.FromSeconds(5));
            if (process.ExitCode != 0)
            {
                return null;
            }

            using var reader = new StringReader(output);
            var firstLine = reader.ReadLine();
            return !string.IsNullOrWhiteSpace(firstLine) && File.Exists(firstLine) ? firstLine : null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>Gets the <see cref="FileVersionInfo.FileVersion"/> for an assembly.</summary>
    /// <param name="context">The cake context.</param>
    /// <param name="assemblyPath">The path to the assembly file.</param>
    /// <returns>The file version.</returns>
    public static string GetAssemblyFileVersion(this Context context, FilePath assemblyPath)
    {
        var versionInfo = FileVersionInfo.GetVersionInfo(context.MakeAbsolute(assemblyPath).FullPath);
        var fileVersion = versionInfo.FileVersion;
        return Version.TryParse(fileVersion, out _) ? fileVersion : $"{versionInfo.FileMajorPart}.{versionInfo.FileMinorPart}.{versionInfo.FileBuildPart}";
    }
}
