const CardPin = document.getElementById("card-pin");
const paymentBtn = document.getElementById("payment-btn");
const paymentForm = document.getElementById("paymentForm");
const serverMsg = document.getElementById("server=msg");

const formDataToObject = (formData) => {
  const response = {};
  formData.forEach((value, key) => {
    response[key] = value;
  });
  return response;
};

paymentBtn.addEventListener("click", (e) => {
  console.log("button clicked.");
  e.preventDefault();
  let data = new FormData(paymentForm);
  const payload = formDataToObject(data);
  console.log("payload:", payload);
  fetch("/user/createorder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log("got here in first responce:", data);
      if (data.status === "error") {
        serverMsg.innerText = data.message;
      }
      if (data.methodForPayment === "pin") {
        CardPin.style.display = "block";
        console.log("done");
      } else {
        serverMsg.innerText = "card not accepted";
      }
    });
});
