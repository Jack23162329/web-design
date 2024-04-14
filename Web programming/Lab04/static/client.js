// displayView = function(view){
//     document.getElementById("view").innerHTML = document.getElementById(view).innerHTML;
//   }
// drag & drop function
function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerHTML);
    console.log(ev.target.id)
    console.log(ev.target)

    // assume we'll get drag
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    console.log(data)
    var word = document.createElement('p')
    word.innerHTML = data
    ev.target.innerHTML = word.innerHTML;

}
function View(name)
{   
    var viewcontent = document.getElementById(name)
    document.body.innerHTML = viewcontent.innerHTML
}

function clientSocket(){
    var socket = new WebSocket("ws://"+ location.host +'/profileview');
    // request from the server 
    socket.onopen = function(){
        var token = JSON.parse(localStorage.getItem("token")).token;
        socket.send(token)
    }
    socket.onclose = function(){
        socket = null
    }
    // socket.onmessage

    // socket.onerror = function(error){
    // }
    socket.addEventListener('message', (event)=>{
        if(event.data == "signout"){
            localStorage.setItem('token', "");
            View("welcomeview")
        }
    });

}
window.onload = function()
{
    var token = localStorage.getItem("token")
    

    // localStorage.removeItem("token");
    if(token){
        // var email = JSON.parse(localStorage.getItem("token")).email
        
        View("profileview")
        displaypage()
        clientSocket()
        
    }else{
        View("welcomeview")
    }
}


function signupvalidation(formData)
{
    var password = formData.s_password.value
    var confirm_password = formData.c_password.value
    
    var message = document.getElementById("message")

    if(password == confirm_password){

        var email = formData.s_email.value
        var firstname = formData.name.value
        var familyname = formData.F_name.value
        var gender = formData.gender.value
        var city = formData.city.value
        var country = formData.Country.value
    }
    else{
        var email = ""
        message.textContent = "Repeated password doesn't fit with the original"
    }
    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        // 4 : request finished and response is ready, 200: 'OK'
        // this == xml
        if(this.readyState == 4 ){ 
            var resp = JSON.parse(xml.responseText);
            if (this.status == 201){
                message.textContent = "New User Created";
                message.style.backgroundColor = "white"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 400){
                message.textContent = "Wrong Data format";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 409){
                message.textContent = "User alreadt exist😊";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 405){
                message.textContent = "Methods doesn't allowed";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 500){
                message.textContent = "Failed to create a new user 🙃";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
        }
    }

    xml.open('POST',"sign_up", true);
    xml.setRequestHeader('Content-type', 'application/json; charset = utf-8');
    xml.send(JSON.stringify({'email': email, 'password': password, 'firstname': firstname, 'familyname': familyname, 'gender': gender, 'city': city, 'country': country}));
}
// sign-in------------------------------------------
function signin(formData)
{

    event.preventDefault()
    var message = document.getElementById("message")
    var email = formData.email.value
    var password = formData.password.value

    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if(this.readyState == 4){
            var resp = JSON.parse(xml.responseText);
            if (this.status == 200){
                var newToken = {'email': email, 'token': resp.data}
                localStorage.setItem("token",JSON.stringify(newToken))
                clientSocket()
                displaypage()
            } 
            else if (this.status == 400){
                message.textContent = "Wrong Password or username";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 401){
                message.textContent = "Wrong Username or Password";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 404){
                message.textContent = "user Doesn't exist!";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 405){
                message.textContent = "Methods doesn't allowed🙃";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
            else if (this.status == 500){
                message.textContent = "Failed to sign in🙃";
                message.style.backgroundColor = "red"
                setTimeout(function () {
                    message.textContent = "";
                    message.style.backgroundColor = ""
                }, 1500);
            }
                
        }

    }

    xml.open('POST',"sign_in", true);
    xml.setRequestHeader('Content-type', 'application/json; charset = utf-8');
    xml.send(JSON.stringify({'email': email, 'password': password}));
}

function displaypage()
{
    View("profileview")
    displayHometab()
    displayaccountpage()
    attachTab()
}

// let the page won't log out each time we refresh it~~
function displayHometab()
{
    
    var token = JSON.parse(localStorage.getItem("token")).token;
    
    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if(this.readyState == 4 ){
            var resp = JSON.parse(xml.responseText);
            if (this.status == 200){
                upload_comment("Sign in successfully")
                var Name = document.getElementById("Name")
                var gender = document.getElementById("gender")
                var city = document.getElementById("city")
                var Country = document.getElementById("Country")
                var Email = document.getElementById("Email")

                Name.textContent = resp.data.firstname +" "+ resp.data.familyname
                gender.textContent = resp.data.gender
                city.textContent = resp.data.city
                Country.textContent = resp.data.country
                Email.textContent = resp.data.email
    
            }
            else if (this.status == 401){ 
                upload_comment(resp.message)
            }
            else if (this.status == 404){
                upload_comment("Failed to load info~")
            }
        }
    }

    xml.open("GET","get_user_data_by_token", true);
    xml.setRequestHeader('Content-type','application/json; charset=utf-8');
    xml.setRequestHeader('Authorization', token);
    xml.send();
    
}

function signout()
{
        var token = JSON.parse(localStorage.getItem("token")).token;
        var email = JSON.parse(localStorage.getItem("token")).email;

        

        // var sign_out = serverstub.signOut(token)
        var xml = new XMLHttpRequest();
        xml.onreadystatechange = function(){
            if(this.readyState == 4){
                var resp = JSON.parse(xml.responseText)
                if (this.status == 200){

                    localStorage.removeItem("token");
                    View("welcomeview")
                    
                    message.textContent = resp.message
                    message.style.backgroundColor = "white"
                    setTimeout(function () {
                        message.textContent = "";
                        message.style.backgroundColor = ""
                        
                    }, 1500);
                }
                else if (this.status == 400){
                    message.textContent = "User doesn't exist :(";
                    message.style.backgroundColor = "red"
                    setTimeout(function () {
                        message.textContent = "";
                        message.style.backgroundColor = ""
                    }, 1500);
                }
                else if (this.status == 401){
                    message.textContent = "You are not logged in";
                    message.style.backgroundColor = "red"
                    setTimeout(function () {
                        message.textContent = "";
                        message.style.backgroundColor = ""
                    }, 1500);
                }
                else if (this.status == 405){
                    message.textContent = "";
                    message.style.backgroundColor = "Methods doesn't allowed🙃"
                    setTimeout(function () {
                        message.textContent = "";
                        message.style.backgroundColor = ""
                    }, 1500);
                }
                else if (this.status == 500){
                    message.textContent = "Failed to log out";
                    message.style.backgroundColor = "red"
                    setTimeout(function () {
                        message.textContent = "";
                        message.style.backgroundColor = ""
                    }, 1500);
                }
            }        
        }

        xml.open("DELETE", "sign_out", true);
        xml.setRequestHeader('Content-type','application/json; charset=utf-8');
        xml.setRequestHeader('Authorization', token);
        xml.send();
        
}
function alertforpassword(message)
{
    mistake = document.getElementById("mistake")
    if (message){
        mistake.textContent = message
        setTimeout(function () {
            mistake.textContent = "";
        }, 1500);
    }
    else{
        return
    }
}

// changing the password
function changePassword(formData)
{
    
    var oldPassword = formData.oldpassword.value
    var newPassword = formData.newpassword.value
    var confirm_password = formData.confirmpassword.value

    // inorder the show the wrong message
    // var mistake = document.getElementById("mistake")
    var token = JSON.parse(localStorage.getItem("token")).token
    
    
    // const changePassword = serverstub.changePassword(token, oldPassword, newPassword)
    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if(this.readyState == 4){
            var resp = JSON.parse(xml.responseText);
            if(this.status == 200){
                alertforpassword(resp.message)
            }
            else if(this.status == 400){
                alertforpassword(resp.message)
            }
            else if(this.status == 401){
                alertforpassword(resp.message)
            }

        }
    }


    xml.open('PUT',"change_password" ,true);
    xml.setRequestHeader('Content-type','application/json; charset=utf-8');
    xml.setRequestHeader("Authorization", token);
    xml.send(JSON.stringify({'oldpassword':oldPassword, 'newpassword':newPassword, 'confirm_password':confirm_password}))
    // PUT just like PUSH, send function should send a "string" back~
    


}
function upload_comment(content){
    var wrongmessage = document.getElementById("Hclient")
    if (content){
        wrongmessage.textContent = content
        setTimeout(function () {
            wrongmessage.textContent = "";
        }, 1500);
    }
    else{
        return
    }
}
function uploadmessage(messageId)
{
    //get post message content
    let message = document.getElementById(messageId).value
    
    var token = JSON.parse(localStorage.getItem("token")).token
    var User_email = JSON.parse(localStorage.getItem("token")).email
    let email;
    // === call strict equality operator, even the type needs to be the same!!
    // ex. 1 === 1 (true)
    // ex. '1' === 1 (false)
    // and it's the reason why postOwnMessage need to be string
    if(messageId === 'postOwnMessage'){
        email = User_email
    }
    else{
        email = toEmail
    }

    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if(this.readyState == 4){
            var resp = JSON.parse(xml.responseText);
            if(this.status == 201){
                upload_comment(resp.message)
            }else if(this.status == 400){
                upload_comment(resp.message)
            }else if(this.status == 401){
                upload_comment(resp.message)
            }else if(this.status == 405){
                upload_comment("Method doesn't allowed")
            }else if(this.status == 500){
                upload_comment("okay lol")
            }
        }
    }
    xml.open("POST","post_message", true);
    xml.setRequestHeader('Content-type','application/json; charset=utf-8');
    xml.setRequestHeader('Authorization', token);
    xml.send(JSON.stringify({'message': message, 'email': email}));
}

function refreshbottom(wallId, dare)
{
    
    var token = JSON.parse(localStorage.getItem("token")).token
    var User_email = JSON.parse(localStorage.getItem("token")).email
    
    
    let email ;
    if(dare == 'ownWall'){
        email = User_email
    }
    else if(dare == 'otherWall'){
        email = toEmail;
    }

    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if(this.readyState == 4){
            var resp = JSON.parse(xml.responseText);
            if(this.status == 200){
                var postarea = document.getElementById(wallId)
                // get the wall that u wanna send the message to
                removeAllChildElement(postarea)
                // remove everything from postarea
                upload_comment(resp.message)
                // the problem we use to hv is like everytime send a new message, the 
                // old one dissapear, which mean it doesn't save it at all, that why we need getUserMessageByEmail

                // get all the data that we upload before 
                for (i = 0; i < resp.messages.length; i++) {
                    var container = document.createElement('div')
                    container.className = "container"

                    // for email
                    var writer = document.createElement('p')
                    writer.className = "writer"
                    writer.innerHTML = resp.messages[i].email
                    writer.id = "drag1"
                    writer.draggable = "true"
                    writer.ondragstart = "drag(event)"
                    // giving value to the writer then push it into the wall
                    container.appendChild(writer)
                    // for messages
                    var content = document.createElement('p')
                    content.className = "content"
                    console.log(content)


                    // content.ondrop() = "drop(event)"
                    content.innerHTML = resp.messages[i].message
                    content.id = "drag2"
                    content.draggable = "true"
                    content.ondragstart = "drag(event)"
                    
                    container.appendChild(content)
                    postarea.appendChild(container)

                    // {writer: 'jhech107@student.liu.se', content: 'hi'} two element in one
                    // 換行問題~~
                }
            }
            else if (this.status == 400){
                upload_comment("your wall is empty...")
            }
            else if(this.status == 401){
                upload_comment(resp.message)
            }

            else if(this.status == 404){
                upload_comment(resp.message)
            }
            else if (this.status == 405){
                upload_comment("Method doesn't allowed")
            }
            else if (this.status == 500){
                upload_comment("how laaa")
            }
        }
    }

    xml.open("GET","get_user_messages_by_email/" + email, true);
    xml.setRequestHeader('Content-type','application/json; charset=utf-8');
    xml.setRequestHeader('Authorization', token);
    xml.send();
}

function search_comment(content){
    var usererror = document.getElementById("UsernotExist")
    usererror.textContent = content
    setTimeout(function () {
        usererror.textContent = "";
        usererror.style.background = "none"
    }, 1500);
}
function search_users(formData)
{
    event.preventDefault()
    var token = JSON.parse(localStorage.getItem("token")).token
    var seeya = document.getElementById("contact")
    var useremail = formData.searching.value;

    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if(this.readyState == 4){
            var resp = JSON.parse(xml.responseText);
            
            if (this.status == 200){
                search_comment("it's him!!")
                
                var Name = document.getElementById("Name_other")
                var gender = document.getElementById("gender_other")
                var city = document.getElementById("city_other")
                var Country = document.getElementById("Country_other")
                var Email = document.getElementById("Email_other")            
                var userData = resp.data;
                Name.textContent = userData.firstname +" "+ userData.familyname
                gender.textContent = userData.gender
                city.textContent = userData.city
                Country.textContent = userData.country
                Email.textContent = userData.email
                toEmail = useremail;
                var browseview = document.getElementById("otherWall")
                
                browseview.style.display = "block"
                seeya.style.display = "none" 

            }else if(this.status == 404){
                search_comment(resp.message)
            }else if(this.status == 401){
                search_comment(resp.message)
            }
            else if(this.status == 405){
                search_comment("Method doesn't allowed")
            }
            else if (this.status == 500){
                search_comment("what ar u doing la lol")
            }
        }
    }
    xml.open("GET","get_user_data_by_email/"+ useremail, true);
    xml.setRequestHeader('Content-type','application/json; charset=utf-8');
    xml.setRequestHeader('Authorization', token);
    xml.send();
    
}


function removeAllChildElement(pElement) 
{
    while (pElement.firstChild) {
        pElement.removeChild(pElement.firstChild)
    }
}


// for the invisibility of the passwords

function togglevisibility()
{
    const oldpassword = document.getElementById("oldpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}
function togglevisibility_1()
{
    const oldpassword = document.getElementById("newpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}
function togglevisibility_2()
{
    const oldpassword = document.getElementById("confirmpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}
// inorder to change different page by using the tab system
function attachTab()
{
    const tabs = document.querySelectorAll('[data-tab-target]')
        const tabContents = document.querySelectorAll('[data-tab-content]')
        
        tabs.forEach(tab => {
            tab.addEventListener('click', ()=>{

                const target = document.querySelector(tab.dataset.tabTarget)

                tabContents.forEach(tabContent => {
                    tabContent.classList.remove('active')
                    // remove everything first
                 })

                tabs.forEach(tab => {
                    tab.classList.remove('active')
                 })
                tab.classList.add('active')
                // make the color stay after we click that tab
                target.classList.add('active')
                // only activate the one we click
            })
        })
        
}
function displayaccountpage()
{
    
    var visibility = document.getElementById("icon")
    visibility.addEventListener("click", togglevisibility)
    
    var visibility_1 = document.getElementById("icon-2")
    visibility_1.addEventListener("click", togglevisibility_1)
    
    var visibility_2 = document.getElementById("icon-3")
    visibility_2.addEventListener("click", togglevisibility_2)
    
    var bye_bye = document.getElementById("signout")
    bye_bye.addEventListener("click", signout)
}

