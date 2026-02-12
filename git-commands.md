# Git "unknown compression method" xatosini tuzatish

## Muammo
```
Cannot create property 'caller' on string 'unknown compression method
```

## Yechimlar

### 1. Asosiy yechim (terminalda ishlatish)
```bash
# Git konfiguratsiyasini tozalash
git config --global --unset core.compression
git config --global --unset core.loosecompression

# Yangi konfiguratsiyani o'rnatish
git config --global core.compression 0
git config --global core.loosecompression 0

# Cache'ni tozalash
git rm -r --cached .
git reset HEAD

# Garbage collection
git gc --prune=now
```

### 2. Agar yuqoridagi ishlamasa
```bash
# Git'ni qayta o'rnatish
git config --global --unset-all core.compression
git config --global core.compression 0

# Repository'ni qayta boshlash
git clean -fd
git reset --hard HEAD
```

### 3. Oxirgi chora
```bash
# Yangi repository yaratish
cd ..
mv your-project-name your-project-backup
git clone your-remote-url your-project-name
cd your-project-name
# Fayllarni backup'dan ko'chirish
```

## Oldini olish
- Git versiyasini yangilab turish
- Katta fayllarni Git LFS bilan saqlash
- Muntazam `git gc` ishlatish