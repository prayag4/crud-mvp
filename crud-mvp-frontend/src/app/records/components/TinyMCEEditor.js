"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function TinyMCEEditor({ value, onChange }) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey="vsbtvy1dmspg79otrvvq4wthvu3qc3g3igrz34ysdlu0migl" // Get from https://www.tiny.cloud
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      init={{
        height: 300,
        menubar: true,
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount"
        ],
        toolbar:
          "undo redo | formatselect | bold italic backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | removeformat | help",
        skin: "oxide",
        content_css: "default",
        iframe: true // 🔹 Forces TinyMCE to load in an iframe
      }}
      onEditorChange={(newContent) => onChange(newContent)}
    />
  );
}
