const express = require('express');
const app = express();
app.use(express.json());

const sql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');


require('dotenv').config();

const db = sql.createConnection({
    user: "root",
    host: "localhost",
    password: "felosql",
    database: "testowe"
});


const fs = require('fs');
const path = require('path');


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });



app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logika autoryzacji JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Middleware autoryzacji
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Brak tokenu' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Nieprawidłowy token' });
        req.userId = decoded.id;
        next();
    });
}




// Wyświetlanie wszystkich łowisk
app.get('/lowiska', (req, res) => {
    db.query('SELECT * FROM lowiska', (err, result) => {
        if (err) {
            console.error("Błąd podczas pobierania łowisk", err);
            res.status(500).json({ error: 'Błąd serwera. Nie udało się pobrać danych' });
        } else {
            res.status(200).json(result);
        }
    });
});

// Wyświetlanie łowiska na podstawie ID
app.get('/lowiska/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM lowiska WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error("Błąd podczas pobierania łowisk", err);
            res.status(500).json({ error: 'Błąd serwera. Nie udało się pobrać danych' });
        } else {
            if (result.length > 0) {
                res.status(200).json(result[0]);
            } else {
                res.status(404).json({ error: 'Nie znaleziono łowiska o podanym ID' });
            }
        }
    });
});

// Wyświetlanie łowisk na podstawie typu
app.get('/lowiska/typ/:typ', (req, res) => {
    const typ = req.params.typ;
    db.query('SELECT * FROM lowiska WHERE typ = ?', [typ], (err, result) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// Wyświetlanie łowisk na podstawie lokalizacji
app.get('/lowiska/lokalizacja/:lokalizacja', (req, res) => {
    const lokalizacja = req.params.lokalizacja;
    db.query('SELECT * FROM lowiska WHERE lokalizacja = ?', [lokalizacja], (err, result) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

// Dodawanie nowego łowiska
app.post('/lowiska', authMiddleware, (req, res) => {
    const { nazwa, typ, lokalizacja, opis, data_otwarcia } = req.body;

    db.query('INSERT INTO lowiska (nazwa, typ, lokalizacja, opis, data_otwarcia) VALUES (?,?,?,?,?)', [nazwa, typ, lokalizacja, opis, data_otwarcia], (err, result) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(201).json({ message: 'Lowisko zostało dodane', id: result.insertId });
        }
    });
});



// Dodawanie opinii
app.post('/lowiska/:id/ocena', authMiddleware, upload.single('zdjecie_url'), (req, res) => {
    const id = parseInt(req.params.id);
    const { ocena, komentarz } = req.body;
    const user_id = req.userId;
    const zdjecie_url = req.file ? `/uploads/${req.file.filename}` : '';


    const query = 'INSERT INTO Opinia (ocena, komentarz, data_dodania, user_id, lowiska_id, zdjecie_url) VALUES (?, ?, NOW(), ?, ?, ?)';

    db.query(query, [ocena, komentarz, user_id, id, zdjecie_url], (err, result) => {
        if (err) {
            console.error("Błąd przy dodawaniu opinii:", err);
            return res.status(400).json({ error: 'Wystąpił błąd podczas dodawania opinii.' });
        }

        const newOpinion = {
            id: result.insertId,
            ocena,
            komentarz,
            zdjecie_url: zdjecie_url ? `http://localhost:3002${zdjecie_url}` : null,
            data_dodania: new Date().toISOString(),
        };

        res.status(201).json(newOpinion);
    });
});


app.get('/lowiska/:id/opinia', (req, res) => {
    const id = req.params.id;
    db.query('select o.id, o.ocena, o.komentarz, o.data_dodania, o.zdjecie_url, u.username from opinia o JOIN user u ON u.id = o.User_id where lowiska_id = ?',[id], (err, result) => {
        if (err) {
            res.status(400).json(err)
        } else {
            res.status(200).json(result);
        }
    })
})


// username na podstawie emiala

app.get('/api/user/:email', async (req, res) => {
    const email = req.params.email;
    db.query('SELECT username, id, email FROM user WHERE email = ?', [email], (err, result) => {
        if (err) {
            res.status(400).json(err);
        } else {
            if (result.length > 0) {
                res.status(200).json(result[0]);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        }
    });
});

// dane usera na podstawie jego id

app.get('/api/user/id/:id', authMiddleware, async (req, res) => {
    const userId = req.params.id;

    console.log(userId);

    db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd bazy danych' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
        }

        return res.status(200).json(result[0]);
    });
});

// wszystkei opinie danego usera

app.get('/api/user/:id/opinie', async (req, res) => {
    const userId = req.params.id;

    db.query('SELECT o.id, o.ocena, o.komentarz, o.data_dodania, l.nazwa, l.id as lowisko_id FROM opinia o JOIN lowiska l ON o.lowiska_id = l.id WHERE o.user_Id = ?',[userId], (err, result) => {
        if (err) {
            return res.status(500).json({message: "Błąd bazy danych"})
        }
        return res.status(200).json(result);
    });

})

// usuwanie opinii

app.delete('/api/opinia/:id', async (req, res) => {
    const opiniaId = req.params.id;

    db.query("DELETE FROM opinia where id = ?",[opiniaId], (err, result) => {
        if (err) {
            return res.status(500).json({message: "Błąd bazy danych"})
        }

        return res.status(200).json(result);
    })
})

// wyswietlanie ostatio dodanych 10 opinii, z username i nazwa lowiska

app.get('/api/opinie', async (req, res) => {
    db.query('SELECT o.id, o.ocena, o.komentarz, o.data_dodania, l.nazwa, u.username, l.id as lowisko_id FROM opinia o JOIN lowiska l ON o.lowiska_id = l.id JOIN user u ON u.id = o.User_id ORDER BY o.data_dodania DESC LIMIT 12', (err, result) => {
        if (err) {
            return res.status(500).json({message: "Błąd bazy danych"});
        }
        if (result.length === 0) {
            return res.status(404).json({message: "Nie znaleziono opinii"});
        }
        return res.status(200).json(result);
    });
});

// wyswietlanie zdjec z lowiska z opinii
app.get('/api/lowiska', async (req, res) => {
    db.query('SELECT l.id, l.nazwa, GROUP_CONCAT(o.zdjecie_url) as zdjecia_url FROM opinia o JOIN lowiska l on l.id = o.lowiska_id WHERE o.zdjecie_url IS NOT NULL AND o.zdjecie_url <> "" GROUP BY l.nazwa, l.id', (err, result) => {
        if (err) {
            return res.status(500).json({message: "Błąd bazy danych"});
        }
        if (result.length === 0) {
            return res.status(404).json({message: "Nie znaleziono lowisk ze zdjeciami"});
        }
        return res.status(200).json(result);
    })
})

// zmiana hasła
app.put('/api/update-password', async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
    }

    db.query('SELECT * FROM USER WHERE id = ?', [userId], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd bazy danych' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
        }

        const user = result[0];


        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(400).json({ message: 'Nieprawidłowe stare hasło.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        db.query('UPDATE USER SET password = ? WHERE id = ?', [hashedNewPassword, userId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Błąd bazy danych' });
            }

            return res.status(200).json({ message: 'Hasło zostało pomyślnie zaktualizowane.' });
        });
    });
});


// Rejestracja użytkownika
app.post('/api/register', async (req, res) => {
    const {username, email, password} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
    }

    db.query('SELECT * FROM USER WHERE email = ?', [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd bazy danych' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: "Użytkownik o podanym mailu już istnieje!" });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        db.query("INSERT INTO user (username, email, password) values (?,?,?)", [username, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Błąd bazy danych" });
            }


            const token = generateToken(result.insertId);
            return res.status(201).json({ message: "Pomyślnie zarejestrowano", token });
        });
    });
});


// Logowanie użytkownika
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
    }

    db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Błąd bazy danych' });
        if (results.length === 0) return res.status(400).json({ message: 'Nieprawidłowe dane logowania' });

        const user = results[0];


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Nieprawidłowe dane logowania' });

        const token = generateToken(user.id);
        res.json({ message: 'Logowanie udane', token });
    });
});




const PORT = 3002;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
