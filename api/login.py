def handler(request):
    data = request.json()
    user = data.get("user")
    password = data.get("pass")

    # Admin mi? (Senin belirttiğin mantık)
    # Varsayılanlar veya Supabase'den gelen verilerle kontrol et
    if user == "admin" and password == "1a2b3c4d":
        return {"status": "success", "role": "admin"}
    
    # Normal kullanıcı mı?
    elif user == "ardakaank" and password == "kardakaan_2014":
        return {"status": "success", "role": "user"}
    
    else:
        return {"status": "error", "message": "Geçersiz bilgiler"}
