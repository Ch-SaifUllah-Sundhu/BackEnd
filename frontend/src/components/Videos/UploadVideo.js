import React, { useState } from "react";
import { apiRequest } from "../../api";

function UploadVideo() {
  const [form, setForm] = useState({ title: "", description: "", videoFile: "", thumbnail: "", duration: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await apiRequest("/videos", "POST", form);
    if (data.success) {
      alert("Video Uploaded!");
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title"
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input type="text" placeholder="Description"
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="text" placeholder="Video URL"
          onChange={(e) => setForm({ ...form, videoFile: e.target.value })} />
        <input type="text" placeholder="Thumbnail URL"
          onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        <input type="number" placeholder="Duration"
          onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadVideo;
