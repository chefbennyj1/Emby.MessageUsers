using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using MediaBrowser.Controller.Library;
using MediaBrowser.Controller.Net;
using MediaBrowser.Controller.Session;
using MediaBrowser.Model.Logging;
using MediaBrowser.Model.Serialization;
using MediaBrowser.Model.Services;
using MediaBrowser.Model.Session;
using MessageUsers.Configuration;

namespace MessageUsers.Api
{
    [Authenticated(Roles = "User")]
    [Route("/MessageUsers/Message", "POST")]
    public class Message : IReturnVoid
    {
        public string Header { get; set; }
        public string Text { get; set; }
        public string Id { get; set; }
        public List<string> Recipients { get; set; }
    }

    
    public class MessageService : IService, IRequiresRequest
    {
        private static ILogger Logger;
        private static ISessionManager SessionManager;
        private static IUserManager UserManager;
        private static IJsonSerializer JsonSerializer;

        public IRequest Request { get; set; }

        public MessageService(ISessionManager ses, IUserManager user, ILogger log, IJsonSerializer json)
        {
            SessionManager = ses;
            UserManager    = user;
            Logger         = log;
            JsonSerializer = json;
            SessionManager.SessionActivity += SessionManager_SessionActivity;
            
        }
        
        public object Post(Message request)
        {
            //SendMessage(request);
            return SessionManager.Sessions.Count();
        }

        private void SessionManager_SessionActivity(object sender, SessionEventArgs e)
        {
            if (!e.SessionInfo.SupportedCommands.Contains("DisplayMessage")) return;

            var messages = Plugin.Instance.Configuration.Messages;
            for (var i = messages.Count - 1; i >= 0; i--)
            {
                var message = messages[i];
                foreach (var recipient in message.Recipients)
                {
                    if (e.SessionInfo.UserName != recipient) continue;
                    SendMessage(message, e.SessionInfo);
                }
                message.Recipients.Remove(e.SessionInfo.UserName);
                if (message.Recipients.Count != 0) continue;
                messages.RemoveAt(i);
            }

            Plugin.Instance.UpdateConfiguration(new PluginConfiguration
            {
                Messages = messages
            });
        }

        private static async void SendMessage(Message message, SessionInfo session)
        {
            //foreach (var session in SessionManager.Sessions.Where(session => session.Capabilities.SupportedCommands.Contains("DisplayMessage"))
            //    .SelectMany(session => message.Recipients, (session, recipient) => new {session, recipient})
            //    .Where(t => t.recipient == t.session.UserName)
            //    .Select(t => t.session))
            //{
                try
                {
                    await SessionManager.SendMessageCommand(session.Id, session.Id,
                        new MessageCommand
                        {
                            Header = message.Header,
                            Text   = message.Text
                        }, CancellationToken.None);
                }

                catch (Exception x)
                {
                    Logger.Error("Message: " + x.Message);
                }

                Logger.Info("Message: " + session.Client + " received message");
            //}
        }
        
    }
}