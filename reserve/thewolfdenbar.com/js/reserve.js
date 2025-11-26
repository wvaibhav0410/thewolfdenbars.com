document.getElementById("reservationForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const message = document.getElementById("message");

  if (!name || !email || !date || !time) {
    message.textContent = "⚠️ Please fill out all fields before submitting.";
    message.style.color = "red";
    return;
  }

  // EmailJS send parameters
  const params = {
    name: name,
    email: email,
    date: date,
    time: time,
  };

  // Replace with your own Service ID and Template ID from EmailJS
  emailjs.send("service_tiihesc", "template_9u4j8uh", params)
    .then(() => {
      message.textContent = `✅ Thank you, ${name}! Your table is reserved for ${date} at ${time}.`;
      message.style.color = "green";
      document.getElementById("reservationForm").reset();
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
      message.textContent = "❌ Failed to send reservation email. Please try again.";
      message.style.color = "red";
    });
});
