# เขียน/ทับ README (PowerShell ใช้แบบนี้แทน echo >>)
"# cat-alysim" | Set-Content -Encoding utf8 README.md

git add .
git commit -m "first commit (with README)"

# ชี้ remote (ถ้าเคยชี้แล้วจะ error ก็ใช้ set-url ด้านล่าง)
git remote add origin https://github.com/koajomza/cat-alysim.git
# ถ้า error: remote 'origin' already exists
# git remote set-url origin https://github.com/koajomza/cat-alysim.git

git branch -M main
git push -u origin main
