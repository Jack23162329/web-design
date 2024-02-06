function saveContact(formData){
    var name = formData.name.value;
    var phoneno = formData.phoneno.value;

    var contact ={
      cname: name,
      cphoneno: phoneno
    };

    var contacts = localStorage.getItem("contacts");
    if (contacts == null){
      contacts = [];
    }else{
      contacts = JSON.parse(contacts);
    }
    contacts.push(contact);


    localStorage.setItem("contacts",JSON.stringify(contacts));
}

function searchContact(formData){
    var name = formData.name.value;
    var contacts = localStorage.getItem("contacts");
    contacts = JSON.parse(contacts);
    var resultElement = document.getElementById("result");
    resultElement.innerHTML = "";
    contacts.forEach(function(contact){
        if (name == contact.cname){
          resultElement.innerHTML += "<h6>" + contact.cname +  " " + contact.cphoneno + "</h6>"

        }
    })


}
