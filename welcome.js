let view;
let alertElement;
let userInfo;
let toEmail = null;

//decide which page should be showed depending on Login or Logout
window.onload = function () {
    alertElement = document.getElementById("validAlert");
    let isLoggedIn = false;
    setView("welcomeview");
}

function setAlert(message) {
    alertElement.innerHTML = "<h4>" + message + "</h4>";
    setTimeout(function () {
        alertElement.innerHTML = "";
    }, 1500);
}

function setView(viewName) {
    let view = document.getElementById("view");
    let viewcontent = document.getElementById(viewName);
    view.innerHTML = viewcontent.innerHTML;
}
function dealSignIn(email, password) {
    let signin_result = serverstub.signIn(email, password);
    console.log(signin_result);
    //display error message which return by server
    if (signin_result.success === false) {
        alertElement.innerHTML = "<h4>" + signin_result.message + "</h4>"
    }
}

//check the password is correct to this account
function validSignin(formData) {
    let email = formData.email.value;
    //validate the number of characters for password
    let password = formData.password.value;
    if (password.length < 7) {
        setAlert("The password is at least 7 characters");
    }
    else {
        signIn(email, password);
    }
}
//check password format is correct
function validSignup(formData) {
    //validate the password format is correct
    let fname = formData.fname.value;
    let lname = formData.lname.value;
    let gender = formData.gender.value;
    let city = formData.city.value;
    let country = formData.country.value;
    let email = formData.email.value;
    let password = formData.password.value;
    let repwd = formData.repwd.value;

    if (password != repwd) {
        setAlert("Both password fields must contain the same string.")
    }
    else if (password.length < 7 || repwd.length < 7) {
        setAlert("The password is at least 7 characters");
    }
    else {
        let user = {
            'email': email,
            'password': password,
            'firstname': fname,
            'familyname': lname,
            'gender': gender,
            'city': city,
            'country': country
        };
        let result = serverstub.signUp(user);
        //turn to the login page
        if (result.success === true) {
            setAlert(result.message);
        }
        else {
            //show error msg which return from serverstubs
            setAlert(result.message);
        }

    }
}

function showUserInfo(elementId, data) {
    let userInfoContent = document.getElementById(elementId);
    if (userInfoContent == null) {
        return;
    }

    //check if there is a table
    let tableElement = userInfoContent.querySelector('table');
    if (tableElement != null) {
        tableElement.remove();
    }

    let table = document.createElement("table");
    userInfoContent.appendChild(table);
    for (let key in data) {
        if (key != 'password' && key != 'token') {
            let tr = document.createElement("tr");
            let keytd = document.createElement('td');
            keytd.innerHTML = key;
            let valuetd = document.createElement('td');
            valuetd.id = "userInfo-fname";
            valuetd.innerHTML = data[key];
            tr.appendChild(keytd);
            tr.appendChild(valuetd);
            table.appendChild(tr);
        }
    }
}

function searchUser(formData) {
    let userEmail = formData.otherEmail.value;
    console.log("input:", userEmail);
    let result = serverstub.getUserDataByEmail(userInfo.token, userEmail);
    setAlert(result.message);
    console.log(result.data);
    if (result.success === true) {
        toEmail = userEmail;
        let browseView = document.getElementById("otherUserHome");
        browseView.style.display = 'block';
        showUserInfo("otherUserInfo", result.data);

    }
}

function postMessage(formData, msgId) {
    //get post message content
    let message = document.getElementById(msgId).value;
    if (message == "") {
        setAlert("Empty Message Shouldn't be posted");
        return;
    }
    let email;
    if (msgId === postOwnMessage) {
        email = userInfo.email;
    }
    else {
        email = toEmail;
    }
    let result = serverstub.postMessage(userInfo.token, message, email);
    
    setAlert(result.message);
    if (result.success === true) {
        document.getElementById(msgId).value = "";
    }
}

function removeAllChildElement(pElement) {
    while (pElement.firstChild) {
        pElement.removeChild(pElement.firstChild);
    }
}

function reloadMsgWall(walltId, whopost) {
    let email;
    if (whopost == 'ownWall') {
        email = userInfo.email;
    }
    else if (whopost == 'otherWall') {
        email = toEmail;
    }

    let result = serverstub.getUserMessagesByEmail(userInfo.token, email);
    console.log(email)
    setAlert(result.message);
    if (result.success === true) {
        let mypostedArea = document.getElementById(walltId);
        removeAllChildElement(mypostedArea);
        //get all messages
        let messages = result.data;
        console.log(messages);
        for (i = 0; i < messages.length; i++) {
            let msgContainer = document.createElement('div');
            msgContainer.className = "msgContainer";
            let writer = document.createElement('p');
            writer.className = "writer";
            writer.innerHTML = messages[i].writer;
            msgContainer.appendChild(writer);
            let content = document.createElement('p');
            content.className = "font-18";
            content.innerHTML = messages[i].content;
            msgContainer.appendChild(content);
            mypostedArea.appendChild(msgContainer);
        }
    }

}

//lab1 - Step 6
function showPanel(panelId) {
    //test for the data in the tab shall be preserved without asking the server stub again
    // document.getElementById(panelId + '-panel').innerHTML += "Hi/n"

    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.style.display = "none";
    });

    // Show the selected panel
    document.getElementById(panelId + '-panel').classList.add('active-panel');
    let panel = document.getElementById(panelId + '-panel');
    panel.style.display = "block";

    // Hide all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active-tab');
    });

    // Highlight the selected tab
    let element = document.getElementById(panelId + '-tab');
    element.classList.add("active-tab");

    if (panelId == 'home')
        showUserInfo("userInfo", userInfo);

}

function acountPanel(formData) {
    let oldPassword = formData.oldPassword.value;
    let newPassword = formData.newPassword.value;
    let rePassword = formData.rePassword.value;
    forChangePassword(oldPassword, newPassword, rePassword);
}

function forChangePassword(oldPassword, newPassword, rePassword) {
    //valid password format
    if (newPassword != rePassword) {
        setAlert("Both password fields must contain the same string");
    }
    else if (oldPassword < 7 || newPassword.length < 7 || rePassword.length < 7) {
        setAlert("The password is at least 7 characters");
    }
    else {
        //pass the validation
        let result = serverstub.changePassword(userInfo.token, oldPassword, newPassword);
        setAlert(result.message);
    }

}

function signOut() {
    console.log(userInfo);
    let result = serverstub.signOut(userInfo.token);
    setAlert(result.message);
    if (result.success === true) {
        let timeOut = setTimeout(setView('welcomeview'), 1500);
    }
}

function getUserData(token) {
    let result = serverstub.getUserDataByToken(token);
    userInfo = result.data;
    userInfo['token'] = token;
    console.log(result.data);
}

function signIn(email, password) {
    let result = serverstub.signIn(email, password);
    setAlert(result.message);
    if (result.success === true) {
        getUserData(result.data);
        setView('profileview');
        showUserInfo("userInfo", userInfo);
    }

}


