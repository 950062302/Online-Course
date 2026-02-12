# Git "unknown compression method" xatosini tuzatish

## Variant 1: To'liq qayta yaratish (eng xavfsiz)

```bash
# 1. Joriy repository'ni backup qilish
cp -r . ../project-backup

# 2. Yangi repository yaratish
cd ..
git clone <your-remote-url> project-new
cd project-new

# 3. O'z fayllaringizni ko'chirish
rm -rf * .*  # Faqat .git papkasini saqlab qolish
cp -r ../project-backup/* .
cp -r ../project-backup/.* .

# 4. Qayta commit qilish
git add .
git commit -m "Restore from backup"
git push origin main --force
```

## Variant 2: Mahalliy tuzatish (agar muhim commit'lar bo'lsa)

```bash
# 1. Backup qilish
cp -r .git ../git-backup

# 2. Git obyektlarini tozalash
git fsck --full --dangling
git prune
git gc --aggressive --prune=now

# 3. Indexni qayta yaratish
git reset --hard HEAD
git clean -fd

# 4. Agar ishlamasa
git config core.compression 0
git config core.loosecompression 0
```

## Variant 3: Oxirgi chora

```bash
# 1. Barcha fayllarni saqlab qolish
mkdir ../temp-backup
cp -r * ../temp-backup/

# 2. Git'ni to'liq o'chirish
rm -rf .git

# 3. Yangi repository
git init
git remote add origin <your-remote-url>
git add .
git commit -m "Initial commit after corruption"
git push -u origin main --force
```

## Oldini olish uchun:
- Git versiyasini yangilab turish
- Katta fayllarni Git LFS bilan saqlash
- Muntazam `git gc` ishlatish
- Power off qilishdan oldin `git status` tekshirish