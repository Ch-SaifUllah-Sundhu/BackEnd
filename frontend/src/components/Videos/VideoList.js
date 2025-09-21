import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api";

function VideoList() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    apiRequest("/videos").then((data) => {
      if (data.success) setVideos(data.videos);
    });
  }, []);

  return (
    <div>
      <h2>Videos</h2>
      <ul>
        {videos.map(v => (
          <li key={v._id}>
            <b>{v.title}</b> - {v.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VideoList;
