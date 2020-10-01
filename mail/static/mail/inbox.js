document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add event listener to the form
  document.querySelector("#compose-form").addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

// TODO: Add a success or error message.
function send_email(event) {
  // Modifies the default beheavor so it doesn't reload the page after submitting.
  event.preventDefault();

  // Get the required fields.
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  // Send the data to the server.
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    // Take the return data and parse it in JSON format.
    .then(response => response.json())
    .then(result => {
      load_mailbox("sent");
    })
    .catch(error => alert(error));
}

function make_alert(message) {
  const element = document.createElement('div');
  element.innerHTML = content;
  element.classList.add("alert");
  if (message.has("message")) {
    element.classList.add("alert-success");
  }
  else if (message.has("error")) {
    element.classList.add("alert-danger");
  }

  document.querySelector("#message-div").appendChild(element);
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox, message = "") {
  // Delete any messages if any
  document.querySelector("#message-div").textContent = "";

  // Print a message if any.
  if (message !== "") {
    make_alert()
  }

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(show_email_item);
    })
    .catch(error => console.error(error))
}

function show_email_item(item) {
  const parent_element = document.createElement("div");

  compose_div(item, parent_element);

  // TODO: Add an event listener.
  // parent_element.addEventListener();
  document.querySelector("#emails-view").appendChild(parent_element);
}

function compose_div(item, parent_element) {
  const left_side = document.createElement("p");

  const recipients = document.createElement("strong");
  recipients.innerHTML = item["recipients"].join(", ") + " ";

  left_side.appendChild(recipients);
  left_side.innerHTML += item["subject"];

  parent_element.appendChild(left_side);

  const date = document.createElement("p");
  date.innerHTML = item["timestamp"];
  date.style.textAlign = "right";
  date.className = "text-muted";

  parent_element.appendChild(date);

  parent_element.style.margin = "5px";
  parent_element.style.borderWidth = "3px";
}