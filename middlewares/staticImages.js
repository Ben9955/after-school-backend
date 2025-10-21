import fs from "fs";
import path from "path";

export default function staticImages(req, res, next) {
  const filePath = path.join(process.cwd(), "images", req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.sendFile(filePath);
  });
}
