import React, { useState, useEffect } from "react";
import { apiRequest } from "../../api";

function SubscriptionList() {
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState({ subscriber: "", channel: "" });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const data = await apiRequest("/subscriptions", "POST", form);
    if (data.success) {
      alert("Subscribed!");
      setSubs([...subs, data.subscription]);
    }
  };

  useEffect(() => {
    apiRequest("/subscriptions").then((data) => {
      if (data.success) setSubs(data.subscriptions);
    });
  }, []);

  return (
    <div>
      <h2>Subscriptions</h2>
      <form onSubmit={handleSubscribe}>
        <input type="text" placeholder="Subscriber UserId"
          onChange={(e) => setForm({ ...form, subscriber: e.target.value })} />
        <input type="text" placeholder="Channel UserId"
          onChange={(e) => setForm({ ...form, channel: e.target.value })} />
        <button type="submit">Subscribe</button>
      </form>

      <ul>
        {subs.map(s => (
          <li key={s._id}>{s.subscriber} → {s.channel}</li>
        ))}
      </ul>
    </div>
  );
}

export default SubscriptionList;
