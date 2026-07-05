<?php
// Compatible PHP 5.2+ - Upload de resultats_187.html
// Pas de ini_set, pas de short arrays, pas de __DIR__

$upload_dir = dirname(__FILE__);
$target_file = $upload_dir . '/resultats_187.html';
$message = '';
$message_type = '';

// Traitement du formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['html_file'])) {
    $file = $_FILES['html_file'];
    
    // Vérification des erreurs d'upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $message = 'Erreur lors du téléchargement du fichier.';
        $message_type = 'error';
    } else {
        // Vérification de l'extension
        $file_name = $file['name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        
        if ($file_ext !== 'html' && $file_ext !== 'htm') {
            $message = 'Le fichier doit être un fichier HTML (.html ou .htm)';
            $message_type = 'error';
        } else {
            // Vérification du contenu (basique)
            $file_content = file_get_contents($file['tmp_name']);
            $file_content_lower = strtolower($file_content);
            
            if (strpos($file_content_lower, '<html') === false && strpos($file_content_lower, '<!doctype') === false) {
                $message = 'Le fichier ne semble pas être un fichier HTML valide.';
                $message_type = 'error';
            } else {
                // Déplacement du fichier
                if (move_uploaded_file($file['tmp_name'], $target_file)) {
                    $message = 'Le fichier a été téléchargé avec succès !';
                    $message_type = 'success';
                } else {
                    $message = 'Erreur lors de l\'enregistrement du fichier.';
                    $message_type = 'error';
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Résultats - La 187</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 40px;
            max-width: 500px;
            width: 100%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
            text-align: center;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .drop-zone {
            border: 3px dashed #667eea;
            border-radius: 10px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f8f9ff;
        }
        
        .drop-zone:hover,
        .drop-zone.dragover {
            background: #e8ebff;
            border-color: #764ba2;
        }
        
        .drop-zone-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .drop-zone-text {
            color: #667eea;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .drop-zone-hint {
            color: #999;
            font-size: 13px;
        }
        
        input[type="file"] {
            display: none;
        }
        
        .file-name {
            margin-top: 15px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 5px;
            font-size: 14px;
            color: #333;
            text-align: center;
        }
        
        .btn {
            width: 100%;
            padding: 15px;
            margin-top: 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #764ba2;
        }
        
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .message {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .back-link {
            text-align: center;
            margin-top: 20px;
        }
        
        .back-link a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        
        .back-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Upload des Résultats</h1>
        <p class="subtitle">La 187 - 20ème Anniversaire de la 77</p>
        
        <?php if ($message): ?>
        <div class="message <?php echo $message_type; ?>">
            <?php echo htmlspecialchars($message); ?>
        </div>
        <?php endif; ?>
        
        <form method="post" enctype="multipart/form-data" id="uploadForm">
            <div class="drop-zone" id="dropZone">
                <div class="drop-zone-icon">📄</div>
                <div class="drop-zone-text">Glissez-déposez votre fichier HTML ici</div>
                <div class="drop-zone-hint">ou cliquez pour sélectionner</div>
            </div>
            
            <input type="file" name="html_file" id="fileInput" accept=".html,.htm" required>
            
            <div id="fileName" class="file-name" style="display: none;"></div>
            
            <button type="submit" class="btn" id="submitBtn" disabled>Télécharger le fichier</button>
        </form>
        
        <div class="back-link">
            <a href="./2025_12_14_la77.html">← Retour à la page principale</a>
        </div>
    </div>
    
    <script>
        var dropZone = document.getElementById('dropZone');
        var fileInput = document.getElementById('fileInput');
        var fileName = document.getElementById('fileName');
        var submitBtn = document.getElementById('submitBtn');
        
        // Clic sur la zone de drop
        dropZone.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Sélection de fichier
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                var file = this.files[0];
                fileName.textContent = '📄 ' + file.name;
                fileName.style.display = 'block';
                submitBtn.disabled = false;
            }
        });
        
        // Drag & Drop
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
            
            var files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                var file = files[0];
                fileName.textContent = '📄 ' + file.name;
                fileName.style.display = 'block';
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
<?php
// Pas de ?> pour éviter les espaces/BOM après
