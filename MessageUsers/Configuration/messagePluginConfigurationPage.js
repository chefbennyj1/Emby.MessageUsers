define(["require", "loading", "dialogHelper", "formDialogStyle", "emby-checkbox", "emby-select", "emby-toggle"],
    function(require, loading, dialogHelper) {

        var pluginId = "80c81cfd3a484f6ca146cce1ad31ffd8";
             
        function getUserRecipientHtml(user) {
            var html = "";
              
            html += '<div class="inputContainer" style="display: flex;">';
            html += '<label style="width: auto;" class="emby-toggle-label">';
            html += '<input is="emby-toggle" type="checkbox" id="' + user.Name + '" class="noautofocus emby-toggle emby-toggle-focusring">';
            html += '<span class="toggleLabel">' + user.Name + '</span>';
            html += '</label>';
            html += '</div>';

            return html;
        };

        function getSavedMessagesHtml(message) {

            var html = "";
            html += '<div id="' + message.Id + '" class="listItem savedMessage" style="background: white">';
            html += '<div class="listItemBody">';
            html += '<h3 class="listItemBodyText">' + message.Recipients.length + " User(s) still waiting to receive this message - " + message.Header + '</h3>';
            html += '<h3 class="listItemBodyText">' + message.Recipients.toString() + '</h3>';
            html += '</div>';
            html += '<i class="md-icon btnDeleteProfile" data-index="0">close</i>';
            html += '</div>';


            return html;
        }

        function getRecipientNames(view) {
            var r = [];
            var userListItems = view.querySelectorAll('#recipients input');
            for (var i = 0; i < userListItems.length; i++) {
                if (userListItems[i].checked)
                    r.push(userListItems[i].id);
            }
            return r;
        }

        function loadPageData(view) {

            ApiClient.getPluginConfiguration(pluginId).then(function (config) {

                ApiClient.getUsers().then(function (users) {
                    users.forEach(function (user) {
                        view.querySelector('#recipients').innerHTML += getUserRecipientHtml(user);
                    });
                });

                if (config.Messages != null)
                    config.Messages.forEach(function (message) {
                        view.querySelector('#savedMessages').innerHTML = (getSavedMessagesHtml(message));
                    });
            });
            return false;
        };


        return function (view) {

            view.addEventListener('viewshow', _ => {

                loadPageData(view);

                view.querySelector('#savedMessages').addEventListener('click', (e) => {
                    if (e.target.classList.contains('btnDeleteProfile')) {

                        var messages = [];

                        ApiClient.getPluginConfiguration(pluginId).then((config) => {

                            config.Messages.forEach((m) => {
                                if (m.Id !== e.target.parentElement.id)
                                    messages.push(m);
                            });  

                            config.Messages = messages;

                            ApiClient.updatePluginConfiguration(pluginId, config).then(Dashboard.processPluginConfigurationUpdateResult);
                            var savedMessagesList = view.querySelector('#savedMessages');
                            savedMessagesList.innerHTML = "";

                            if (config.Messages != null)
                                config.Messages.forEach(function (message) {
                                    savedMessagesList.innerHTML = (getSavedMessagesHtml(message));
                                });

                        });

                    } 
                });

                view.querySelector('#createMessage').addEventListener('click', () => {

                    
                    var messages = [];

                    var message = {
                        Header: view.querySelector('#header').value,
                        Text: view.querySelector('#text').value,
                        Recipients: getRecipientNames(view),
                        Id: Math.floor(Math.random() * 100)
                    };  //New message


                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        if (config.Messages)
                            config.Messages.forEach((c) => {
                                messages.push(c);
                            });

                        messages.push(message);

                        config.Messages = messages;

                        ApiClient.updatePluginConfiguration(pluginId, config).then(
                            (result) => {
                                Dashboard.hideLoadingMsg();
                                Dashboard.processPluginConfigurationUpdateResult(result);
                            });
                    });


                    view.querySelector('#savedMessages').innerHTML += (getSavedMessagesHtml(message)); //Write the new message to the list of saved messages
                    return false;
                });


            });
        };
    })