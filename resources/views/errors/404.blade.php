<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Halaman Tidak Ditemukan</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: "Inter", "Segoe UI", sans-serif;
            background: linear-gradient(180deg, #f5f8fc 0%, #eef2f7 100%);
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #2c3e50;
        }

        .logo img {
            width: 180px;
            margin-bottom: 30px;
        }

        .code {
            font-size: 120px;
            font-weight: 800;
            color: #2e3d4d;
            margin: 0;
        }

        .title {
            font-size: 32px;
            font-weight: 700;
            margin-top: 10px;
            color: #445b6e;
        }

        .desc {
            font-size: 17px;
            color: #5c6f82;
            max-width: 520px;
            margin: 20px auto 40px;
            line-height: 1.7;
        }

        .btn {
            background: #22354a;
            padding: 14px 36px;
            border-radius: 40px;
            text-decoration: none;
            font-size: 16px;
            color: white;
            font-weight: 600;
            transition: 0.25s;
            box-shadow: 0 6px 14px rgba(0,0,0,0.15);
        }

        .btn:hover {
            background: #162433;
            transform: translateY(-3px);
        }
    </style>
</head>
<body>

    <div class="logo">
        <img src="https://risbang.kemdiktisaintek.go.id/assets/images/logo/Ditjen%20Risbang.png" alt="Logo">
    </div>

    <div class="code">404</div>
    <div class="title">Halaman Tidak Ditemukan</div>

    <p class="desc">
        Maaf, halaman yang Anda tuju tidak tersedia.<br>
        Silakan kembali ke beranda untuk melanjutkan.
    </p>

    <a class="btn" href="{{ url('/') }}">Kembali ke Beranda</a>

</body>
</html>
