const router = require("express").Router();
const Student = require("../models/Student");

const { upload } = require("../middlewares/multer");

router.post("/fileUpload", upload, async (req, res, next) => {
  if (req.files) {
    if (req.files.image) {
      if (
        req.files.image[0].mimetype == "image/jpeg" ||
        req.files.image[0].mimetype == "image/jpg" ||
        req.files.image[0].mimetype == "image/png"
      ) {
        if (!(req.files.image[0].size <= 10485760)) {
          const error = new Error(
            "Impossible de télécharger une taille de fichier supérieure à 10 Mo"
          );
          error.status = 400;
          throw error;
        } else {
          res.status(200).json(req.files.image[0].path);

          UploadedPicture = {
            image: req.files.image[0].filename,
            status: "To be Validated",
          };
        }
      } else {
        res.status(400).send({
          message:
            "Veuillez sélectionner une image de type de fichier JPEG/JPG/PNG",
        });
        const error = new Error(
          "Veuillez sélectionner une image de type de fichier JPEG/JPG/PNG"
        );
        error.status = 400;
        throw error;
      }
    } else {
      console.log("hello");
      res.status(200).json("");
    }
  }
});
router.post("/resumeUpload", upload, async (req, res, next) => {
  if (req.files) {
    if (
      req.files.resume[0].mimetype === "application/pdf" ||
      req.files.resume[0].mimetype === "application/msword"
    ) {
      if (!(req.files.resume[0].size <= 10485760)) {
        res.status(400).send({
          message:
            "Impossible de télécharger une taille de fichier supérieure à 10 Mo",
        });
      } else {
        uploadedResume = req.files.resume[0].filename;
        await Student.findByIdAndUpdate(req.body.id, {
          resume: uploadedResume,
        });
        res
          .status(200)
          .send({ message: " Le fichier a été ajouté avec succès" });
      }
    } else {
      res.status(400).send({
        message: "Votre fichier CV doit être du type de fichier PDF/DOC/DOCX",
      });
      // error.status = 400;
      // throw error;
    }
  }
});

module.exports = router;
