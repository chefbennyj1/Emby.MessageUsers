using System.Collections.Generic;
using MediaBrowser.Model.Plugins;
using MessageUsers.Api;

namespace MessageUsers.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public List<Message> Messages { get; set; }
    }
    
   
}
