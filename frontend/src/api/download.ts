import axios from "axios"
import { API_URL } from "../config"
import { UploadedFileData } from "../@types/Files";

export const downloadFile = async (file: UploadedFileData) => {
  const response = await axios
    .get(`${API_URL}v1/${file.filePath}`, {
      responseType: 'blob',
    });

  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = file.originalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};