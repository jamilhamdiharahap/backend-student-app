import express from "express";
import upload from "../utils/upload.js";
import { client } from "../database/index.js";
import { responseHandler } from "../helper/responseHelper.js";
import dotenv from "dotenv";
import { authToken } from "../utils/auth.js";
import path from "path";
import fs from "fs";

dotenv.config()

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        let token = req.header("auth");

        let auth = authToken(token);

        if (auth.status !== 200) {
            return res.status(auth.status).send(auth);
        }

        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 5;
        const offset = (page - 1) * itemsPerPage;

        const sanitizedTitle = `%${req.query.name}%`;

        const query = 'SELECT * FROM public.students WHERE name ILIKE $1 LIMIT $2 OFFSET $3';
        const queryCount = 'SELECT COUNT(*) AS row FROM public.students';

        const students = await client.query(query, [sanitizedTitle, itemsPerPage, offset]);
        const { rows } = await client.query(queryCount);

        responseHandler(res, { data: students.rows, message: "data found", status: 2000, rows: parseInt(rows[0].row) });
        return
    } catch (err) {
        responseHandler(res, { data: [], message: err.message, status: 5000 })
        return
    }
});

router.get("/detail", async (req, res) => {
    try {
        let token = req.header("auth");

        let auth = authToken(token);
        console.log(auth.message)
        if (auth.status !== 200) {
            return res.status(auth.status).send(auth);
        }

        const { id } = req.query;
        const query = 'SELECT * FROM public.students WHERE id = $1';

        const students = await client.query(query, [id]);

        const modifiedResults = {
            id: students.rows[0].id,
            created_at: students.rows[0].created_at,
            name: students.rows[0].name,
            place_date_of_birth: students.rows[0].place_date_of_birth,
            nik: students.rows[0].nik,
            status: students.rows[0].status,
            birth_certificate: `${students.rows[0].birth_certificate}`,
            family_card: `${students.rows[0].family_card}`
        }

        responseHandler(res, { data: modifiedResults, message: "data found", status: 2000 });
    } catch (err) {
        responseHandler(res, { data: [], message: err.message, status: 5000 });
    }
});

router.post("/upload", upload.fields([{ name: 'birth_certificate', maxCount: 1 }, { name: 'family_card', maxCount: 1 }]), async (req, res) => {
    try {
        let token = req.header("auth");

        let auth = authToken(token);

        if (auth.status !== 200) {
            return res.status(auth.status).send(auth);
        }

        const { name, place_date_of_birth, nik, status } = req.body;
        const { files } = req;

        if (!files || !files.birth_certificate || !files.family_card) {
            return res.status(400).json({ message: "Both files must be uploaded." });
        }

        const birthCertificateFile = files.birth_certificate;
        const familyCardFile = files.family_card;

        const params = [
            name,
            place_date_of_birth,
            nik,
            status,
            birthCertificateFile[0].filename,
            familyCardFile[0].filename,
        ]

        const query = "INSERT INTO public.students (name, place_date_of_birth, nik, status, birth_certificate, family_card) VALUES($1, $2, $3, $4, $5, $6)";

        const students = client.query(query, params)

        responseHandler(res, { data: (await students).rows, message: "student created successfully", status: 2000 });
        return
    } catch (error) {
        console.log(error)
        responseHandler(res, { data: error.message, message: "Error", status: 5000 });
        return
    }
});

router.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join("public", 'certificate', filename);
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/octet-stream');
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).json({ message: 'File not found', status: 4004 });
        return
    }
});

router.put("/", upload.fields([{ name: 'birth_certificate', maxCount: 1 }, { name: 'family_card', maxCount: 1 }]), async (req, res) => {
    try {
        let token = req.header("auth");

        let auth = authToken(token);
        console.log(auth.message)
        if (auth.status !== 200) {
            return res.status(auth.status).send(auth);
        }

        const { id } = req.query;
        const { name, place_date_of_birth, nik, status } = req.body;

        const birthCertificateFile = req.files['birth_certificate'][0];
        const familyCardFile = req.files['family_card'][0];

        const params = [
            name,
            place_date_of_birth,
            nik,
            status,
            birthCertificateFile.filename,
            familyCardFile.filename,
            id,
        ];

        if (!req.files) {
            throw new Error("No file uploaded");
        }

        const query = "UPDATE public.students SET name = $1, place_date_of_birth = $2, nik = $3, status = $4, birth_certificate = $5, family_card = $6 WHERE id = $7";

        const students = await client.query(query, params);

        responseHandler(res, { data: students.rowCount, message: "Student updated successfully", status: 2000 });
    } catch (error) {
        responseHandler(res, { data: error.message, message: "Error", status: 5000 });
    }
});

router.delete("/", async (req, res) => {
    try {
        let token = req.header("auth");

        let auth = authToken(token);

        if (auth.status !== 200) {
            return res.status(auth.status).send(auth);
        }
        const { id } = req.query;

        const query = "DELETE FROM public.students WHERE id = $1";

        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            responseHandler(res, { data: null, message: "Student not found", status: 4004 });
            return
        } else {
            responseHandler(res, { data: null, message: "Student deleted successfully", status: 2000 });
            return
        }
    } catch (error) {
        responseHandler(res, { data: error.message, message: "Error", status: 5000 });
        return
    }
});


export default router;