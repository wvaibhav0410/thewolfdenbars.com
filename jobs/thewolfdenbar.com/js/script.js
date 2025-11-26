document.getElementById("jobForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const mobile = document.getElementById("mobile").value;

  emailjs.send("service_tiihesc", "template_9u4j8uh", {
    to_email: "wvaibhavw410@gmail.com", // Admin email
    from_name: `${firstName} ${lastName}`,
    from_email: email,
    mobile: mobile,
  })
  .then(() => {
    alert("Application submitted successfully!");
    document.getElementById("jobForm").reset();
  })
  .catch((error) => {
    alert("Error sending details: " + error.text);
  });
});
