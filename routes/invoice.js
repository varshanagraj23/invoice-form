const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

let invoices = []; // In-memory storage for invoices, replace with a database in production

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: fileFilter
});

router.post('/save', upload.single('file'), (req, res) => {
    const invoiceId = req.body.invoiceId;
    const invoice = {
        id: invoiceId || Date.now().toString(),
        qty: req.body.qty,
        amount: req.body.amount,
        total: req.body.total,
        tax: req.body.tax,
        taxAmount: req.body.taxAmount,
        netAmount: req.body.netAmount,
        customerName: req.body.customerName,
        invoiceDate: req.body.invoiceDate,
        file: req.file ? `/uploads/${req.file.filename}` : req.body.file,
        customerEmail: req.body.customerEmail
    };

    if (invoiceId) {
        // Edit existing invoice
        const index = invoices.findIndex(i => i.id === invoiceId);
        invoices[index] = invoice;
    } else {
        // Add new invoice
        invoices.push(invoice);
    }

    res.redirect('/');
});

router.get('/all', (req, res) => {
    res.json(invoices);
});

router.get('/:id', (req, res) => {
    const invoice = invoices.find(i => i.id === req.params.id);
    res.json(invoice);
});

router.delete('/:id', (req, res) => {
    invoices = invoices.filter(i => i.id !== req.params.id);
    res.status(200).send('Invoice deleted');
});

module.exports = router;
