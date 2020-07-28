define(['loading'],
    function (loading) {

        var pluginId = "80c81cfd3a484f6ca146cce1ad31ffd8";

        
        function getUserRecipientHtml(user) {
            var html = "";

            html += '<div class="listItem  sortableOption" >';
            html += '<label class="listItemCheckboxContainer emby-checkbox-label" > ';
            html += '<input name="' + user.Name + '" type="checkbox" is="emby-checkbox" class="emby-checkbox"  data-embycheckbox="true" >';
            html += '<span class="checkboxLabel" > ' + user.Name + '</span >';
            html += '<span class="emby-checkbox-focushelper" ></span >';
            html += '<span class="checkboxOutline" > ';
            html += '<i class="md-icon checkboxIcon checkboxIcon-checked" ></i >';
            html += '<i class="md-icon checkboxIcon checkboxIcon-unchecked" ></i >';
            html += '</span>';
            html += '</label> ';

            html += '</div></div>';


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
                    r.push(userListItems[i].name);
            }
            return r;
        }

        function loadPageData(view) {

            ApiClient.getJSON(ApiClient.getUrl("/MessageHeader")).then(
                (imgInfo) => {
                    view.querySelector("#pluginThumb").style.backgroundImage =
                        "url('data:image/png;base64," + imgInfo.Image + "')";
                });
            

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