displayView = function(){
    // the code required to display a view
    };

window.onload = function(){
    var welcome = document.getElementById("welcomeview");
    var profile = document.getElementById("profileview");
    var token = localStorage.getItem("token");

    // if(token){
    //     document.body.innerHTML = profile.innerHTML;
    // }
    // else{
        document.body.innerHTML = welcome.innerHTML;
    // }
    
    
    // var profile = document.getElementById("welcomeview");
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    // window.alert("Hello TDDD97!");
    
};

function validation(formData){
    var password = formData.s_password.value;
    var confirm_password = formData.c_password.value;
    
    console.log(password, confirm_password);
    var message = document.getElementById("message");
    var signup = document.getElementById("signup");

    if(password == confirm_password){

        var email = formData.s_email.value;
        var firstname = formData.name.value;
        var familyname = formData.F_name.value;
        var gender = formData.gender.value;
        var city = formData.city.value;
        var country = formData.Country.value;

        var user = {
            'email': email,
            'password': password,
            'firstname': firstname,
            'familyname': familyname,
            'gender': 'female',
            'city': city,
            'country': country,
          };
          console.log(user);
        // console.log(email,password, firstname, familyname, gender, city, country);
        // sign-up-------------------------------------------
        var signupvalid = serverstub.signUp(user);
        console.log(signupvalid);
        if(signupvalid.success === true){

            message.textContent = " "
            signup.textContent = signupvalid.message;
            signup.style.color = "blue";
        }
        else{

            signup.textContent = signupvalid.message;
            signup.style.color = "red";
        }
        
    }
    else{
        message.textContent = "Password don't match"
        message.style.backgroundColor = "#ff4d4d";
    }
}
// sign-in------------------------------------------
function signin(formData){

    event.preventDefault()
    var profile = document.getElementById("profileview");
    var signup = document.getElementById("signup");
    var email = formData.email.value;
    var password = formData.password.value;
    var sign_in = serverstub.signIn(email, password);

    if(sign_in.success === true){

        console.log(sign_in.data, sign_in.message)
        localStorage.setItem("token", sign_in.data);
        signup.textContent = sign_in.message;
        signup.style.color = "blue";

        document.body.innerHTML = profile.innerHTML; 
        const tabs = document.querySelectorAll('[data-tab-target]');
        const tabContents = document.querySelectorAll('[data-tab-content]');

        tabs.forEach(tab => {
            tab.addEventListener('click', ()=>{
                const target = document.querySelector(tab.dataset.tabTarget);
                tabContents.forEach(tabContent => {
                    tabContent.classList.remove('active');
                 })
                tabs.forEach(tab => {
                    tab.classList.remove('active');
                 })
                tab.classList.add('active');
                target.classList.add('active');
            })
        })
    }
    else{
        signup.textContent = sign_in.message;
        signup.style.color = "red";
    }
}

function changePassword(formData){
    var oldPassword = formData.oldpassword.value;
    var newPassword = formData.newpassword.value;
    var mistake = document.getElementById("mistake");
    var token = localStorage.getItem("token");
    var changePassword = serverstub.changePassword(token, oldPassword, newPassword);
    if(changePassword.success === true){
        mistake.textContent = changePassword.message;
        console.log(changePassword.message);
    }
    else{
        console.log(changePassword.message)
        mistake.textContent = changePassword.message;
    }

}
// function signout(token){
//     var message = document.getElementById("message");
//     var profile = document.getElementById('profileview');
//     var welcome = document.getElementById("welcomeview");
//     var sign_out = serverstub.signOut(token);
//     if(sign_out.success === true){
//         document.body.innerHTML = welcome.innerHTML;
//         message.textContent = sign_out.message;
//     }else{
//         document.body.innerHTML = profile.innerHTML;
//     }
// }

