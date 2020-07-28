using System;
using System.Collections.Generic;
using System.IO;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Drawing;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using MessageUsers.Configuration;

namespace MessageUsers
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages, IHasThumbImage
    {
        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer) : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
        }

        public static Plugin Instance { get; private set; }

        public override string Name         => "Message Users";
        public ImageFormat ThumbImageFormat => ImageFormat.Png;
        public override Guid Id             => new Guid("80c81cfd3a484f6ca146cce1ad31ffd8");

        public Stream GetThumbImage()
        {
            var type = GetType();
            return type.Assembly.GetManifestResourceStream(type.Namespace + ".thumb.png");
        }
        


        public IEnumerable<PluginPageInfo> GetPages() => new[]
        {
            new PluginPageInfo
            {
                Name                 = "MessageConfigPage",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.MessageConfigPage.html",
                EnableInMainMenu     = true,
                DisplayName          = Name
            },
            new PluginPageInfo
            {
                Name = "messagePluginConfigurationPageJS",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.messagePluginConfigurationPage.js"
            }
        };
    }
}
