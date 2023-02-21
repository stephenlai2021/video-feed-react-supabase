import { useState, useEffect } from "react";
import "./App.css";
// import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { supabaseClient } from "./supabase/config";

// const supabase = createClient(
//   "https://itzgmdgndusfvggjclwk.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emdtZGduZHVzZnZnZ2pjbHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzA2NTgwNDYsImV4cCI6MTk4NjIzNDA0Nn0.pNt5W8ccp8TnrKhRaDzYPuVjKrcazjWh06QUMZ0ZC90"
// );

const CDNURL =
  "https://itzgmdgndusfvggjclwk.supabase.co/storage/v1/object/public/videos/";

// https://ihbkpxujdzyblmtuzwdm.supabase.co/storage/v1/object/public/videos/testfile.mp4

function App() {
  const [videos, setVideos] = useState([]); // [video1, video2, video3]
  const [blob, setBlob] = useState(null);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);

  async function getVideos() {
    const { data, error } = await supabaseClient.storage
      .from("videos") // videos/
      .list("");
    // data: [video1, video2, video3]
    // video1: "coopercodesvideo.mp4" CDNLINK.com/coopercodesvideo.mp4

    if (data !== null) {
      setVideos(data);
    } else {
      console.log(error);
      alert("Error grabbing files from Supabase");
    }
  }

  useEffect(() => {
    getVideos();
  }, []);

  async function uploadFile(e) {
    const videoFile = e.target.files[0];
    console.log("file: ", videoFile.name);

    if (!videoFile) {
      return;
    } else {
      console.log("Upload!");
    }

    const { error } = await supabaseClient.storage
      .from("videos")
      .upload(uuidv4() + "-" + videoFile.name, videoFile);

    setUrl(uuidv4() + "-" + videoFile.name);
    console.log("upload file: ", uuidv4() + "-" + videoFile.name);

    if (error) {
      console.log(error);
      alert("Error uploading file to Supabase");
    }

    getVideos();
  }

  async function downloadFile(file) {
    console.log("download file: ", file);

    const { data, error } = await supabaseClient.storage
      .from("videos")
      .download(file); // get blob

    if (data) {
      console.log("blob: ", data);
      setBlob(data);

      // Convert blob to file
      const file = new File([data], uuidv4() + ".png");
      console.log("file: ", file);
      setFile(file);
    }
    if (error) console.log("error: ", error.message);
  }

  console.log(videos);

  return (
    <div className="container">
      <h1 className="title">VideoFeed</h1>
      <div className="">
        <label for="file">
          Upload your video here! <br />
          <input
            id="file"
            type="file"
            accept="video/mp4"
            onChange={(e) => uploadFile(e)}
            className="fileInput"
          />
        </label>
      </div>

      <div className="gallery">
        {videos.map((video) => {
          console.log(video);
          if (video.name === ".emptyFolderPlaceholder") return null;

          return (
            // <div className="video-wrapper">
              <video controls className="video">
                <source src={CDNURL + video.name} type="video/mp4" />
              </video>
            // </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
