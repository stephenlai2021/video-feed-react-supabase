import { useState, useEffect } from "react";
import "./App.css";
import { v4 as uuidv4 } from "uuid";
import { supabaseClient } from "./supabase/config";

const CDNURL =
  "https://itzgmdgndusfvggjclwk.supabase.co/storage/v1/object/public/videos/";

function App() {
  const [videos, setVideos] = useState([]); // [video1, video2, video3]
  const [fileType, setFileType] = useState(null);
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
    console.log("file: ", videoFile);
    console.log("filename: ", videoFile.name);

    let fileType = videoFile.type.substring(0, videoFile.type.lastIndexOf("/"));
    setFileType(fileType);
    console.log("file type: ", fileType);

    let fileExtension = videoFile.name.split(".").pop();
    console.log("filename extension: ", fileExtension);

    if (!videoFile) {
      return;
    } else {
      const { error } = await supabaseClient.storage
        .from("videos")
        .upload(uuidv4() + "." + fileExtension, videoFile,
          {
            cacheControl: "3600",
            upsert: true,
          }
        );

      if (error) {
        console.log(error);
        alert("Error uploading file to Supabase");
      }

      console.log('file upload successfully !')
    }
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

  return (
    <div className="container">
      <div className="wrapper">
        <label className="upload_cover">
          <input
            type="file"
            id="upload_input"
            accept="video/*,image/*"
            onChange={(e) => uploadFile(e)}
          />
          <span className="upload_icon">➕</span>
        </label>
        <p className="msg">Upload your video here !</p>
      </div>

      <div className="gallery">
        {videos.map((video) => {
          if (video.name.split(".").pop() === "mp4") {
            return (
              <video controls className="video" key={video.name}>
                <source src={CDNURL + video.name} type="video/mp4" />
              </video>
            );
          }

          if (
            video.name.split(".").pop() === "jpg" ||
            video.name.split(".").pop() === "png" ||
            video.name.split(".").pop() === "gif"
          ) {
            return (
              <a href={CDNURL + video.name} target="_blank" download>
                <img
                  className="image"
                  src={CDNURL + video.name}
                  type="image/*"
                  key={video.name}
                />
              </a>
            );
          }
        })}
      </div>
    </div>
  );
}

export default App;
