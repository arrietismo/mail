document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // Add event listener to the form
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

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
      body: body,
    }),
  })
    // Take the return data and parse it in JSON format.
    .then((response) => response.json())
    .then((result) => {
      load_mailbox("sent", result);
    })
    .catch((error) => console.log(error));
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox, message = "") {
  // Delete any messages if any
  document.querySelector("#message-div").textContent = "";

  // Print a message if any.
  if (message !== "") {
    make_alert(message);
  }

  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
    }</h3>`;

  // Get data of the corresponding mailbox from the server.
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((item) => {
        const parent_element = document.createElement("div");

        compose_div(item, parent_element, mailbox);

        // TODO: Add an event listener.
        // parent_element.addEventListener();
        document.querySelector("#emails-view").appendChild(parent_element);
      });
    })
    .catch((error) => console.error(error));
}

/**
 * Renders a bootstrap alert according to the returning status.
 * @param {JSON} message The status message that the server returns
 */
function make_alert(message) {
  const element = document.createElement("div");
  element.classList.add("alert");

  if (message["message"]) {
    element.classList.add("alert-success");
    element.innerHTML = message["message"];
  } else if (message["error"]) {
    element.classList.add("alert-danger");
    element.innerHTML = message["error"];
  }

  document.querySelector("#message-div").appendChild(element);
}

/**
 * Sets and styles an email div according to the given data.
 * @param {JSON} item An email from the returning list.
 * @param {Element} parent_element The element that will be composed.
 */
function compose_div(item, parent_element, mailbox) {
  const content = document.createElement("div");

  const recipients = document.createElement("strong");
  if (mailbox === "sent") {
    recipients.innerHTML = item["recipients"].join(", ") + " ";
  }
  else {
    recipients.innerHTML = item["sender"] + " ";
  }
  content.appendChild(recipients);

  content.innerHTML += item["subject"];

  // Set and style the date.
  const date = document.createElement("div");
  date.innerHTML = item["timestamp"];
  date.style.display = "inline-block";
  date.style.float = "right";

  if (item["read"]) {
    parent_element.style.backgroundColor = "grey";
    date.style.color = "black";
  } else {
    date.className = "text-muted";
  }
  content.appendChild(date);

  content.style.padding = "10px";
  parent_element.appendChild(content);


  // Style the parent element.
  parent_element.style.margin = "5px";
  parent_element.style.borderStyle = "solid";
  parent_element.style.borderWidth = "3px";
  parent_element.style.margin = "10px";
}
