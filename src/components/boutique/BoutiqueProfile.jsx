import React, { useState, useEffect } from "react";
import { FEATURES } from "../../lib/features";
import { supabase } from "../../lib/supabase";
import { Browser } from "@capacitor/browser";

/**
 * Butik profil sayfası.
 * account_type = 'boutique' olan kullanıcıların profil sayfası bu component'i render eder.
 * Ödeme kesilirse account_type = 'normal' olur, bu component render edilmez.
 */
const BoutiqueProfile = ({
  boutiqueUser,
  currentUser,
  session,
  onBack,
  onEditProfile,
  onShowBoost,
  onShowSettings,
  totalLikes,
  activeOutfitsCount,
}) => {
  if (!FEATURES.BOUTIQUE_ACCOUNTS) return null;

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    total_followers: 0,
    avg_rating: null,
    review_count: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = session?.user?.id === boutiqueUser?.id;

  useEffect(() => {
    if (!boutiqueUser?.id) return;
    fetchData();
  }, [boutiqueUser?.id]);

  const fetchData = async () => {
    setLoading(true);
    const [productsRes, statsRes, followRes] = await Promise.all([
      supabase
        .from("outfits")
        .select("*, outfit_media(*)")
        .eq("user_id", boutiqueUser.id)
        .eq("is_boutique_product", true)
        .order("created_at", { ascending: false }),

      supabase
        .from("boutique_stats")
        .select("*")
        .eq("boutique_id", boutiqueUser.id)
        .single(),

      currentUser?.id
        ? supabase
            .from("followers")
            .select("id")
            .eq("follower_id", currentUser.id)
            .eq("following_id", boutiqueUser.id)
            .single()
        : Promise.resolve({ data: null }),
    ]);
    setProducts(productsRes.data || []);
    if (statsRes.data) setStats(statsRes.data);
    setIsFollowing(!!followRes.data);
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUser?.id) return;
    if (isFollowing) {
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", boutiqueUser.id);
      setIsFollowing(false);
      setStats((s) => ({
        ...s,
        total_followers: Math.max(0, s.total_followers - 1),
      }));
    } else {
      await supabase
        .from("followers")
        .insert({ follower_id: currentUser.id, following_id: boutiqueUser.id });
      setIsFollowing(true);
      setStats((s) => ({ ...s, total_followers: s.total_followers + 1 }));
    }
  };

  const getMainImage = (outfit) => {
    const media = (outfit.outfit_media || []).sort(
      (a, b) => a.sort_order - b.sort_order
    );
    return media[0]?.media_url || "";
  };

  return (
    <div style={{ background: "#FAF9F8", minHeight: "100vh" }}>
      {/* Header — kendi profilinde sadece ayarlar butonu, başkasının profilinde tam bar */}
      {isOwnProfile ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "calc(12px + env(safe-area-inset-top, 0px)) 16px 0",
            background: "#FAF9F8",
            position: "relative",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#2f2626" }}>Profil</h1>
          <button
            onClick={onShowSettings}
            style={{
              position: "absolute",
              right: 16,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2f2626",
              padding: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px",
            background: "#FAF9F8",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#374151",
              padding: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2
            style={{
              flex: 1,
              textAlign: "center",
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Veylo
          </h2>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              padding: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      )}

      {/* Profil bilgileri */}
      <div
        style={{
          padding: "8px 16px 20px",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 106,
              height: 106,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FFB2A5 0%, #FFD2B8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <img
              src={boutiqueUser?.avatar_url || ""}
              alt=""
              style={{
                width: 98,
                height: 98,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #FAF9F8",
                background: "#111827",
              }}
            />
          </div>
          {/* VERIFIED BOUTIQUE rozeti */}
          <div
            style={{
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#FDE68A",
              borderRadius: 20,
              padding: "4px 12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              whiteSpace: "nowrap",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#92400E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
              <path d="M12 3v6"></path>
            </svg>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#92400E",
                letterSpacing: 0.5,
              }}
            >
              VERIFIED BOUTIQUE
            </span>
          </div>
        </div>

        <h2
          style={{
            margin: "12px 0 6px",
            fontSize: 22,
            fontWeight: 800,
            color: "#1F2937",
          }}
        >
          {boutiqueUser?.boutique_name || boutiqueUser?.full_name}
        </h2>
        {boutiqueUser?.bio && (
          <p
            style={{
              margin: boutiqueUser?.instagram_handle
                ? "0 auto 12px"
                : "0 auto 24px",
              fontSize: 14,
              color: "#6B7280",
              maxWidth: "280px",
              lineHeight: 1.4,
            }}
          >
            {boutiqueUser.bio}
          </p>
        )}
        {boutiqueUser?.instagram_handle && (
          <a
            href={`https://instagram.com/${boutiqueUser.instagram_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              margin: "0 auto 24px",
              fontSize: 13,
              fontWeight: 700,
              color: "#E1306C",
              textDecoration: "none",
              background: "white",
              padding: "6px 14px",
              border: "1px solid #F3F4F6",
              borderRadius: 20,
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            @{boutiqueUser.instagram_handle}
          </a>
        )}

        {/* İstatistikler */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#111827" }}>
              {stats.total_followers >= 1000
                ? (stats.total_followers / 1000).toFixed(1) + "K"
                : stats.total_followers}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#6B7280",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginTop: 4,
              }}
            >
              FOLLOWERS
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#111827" }}>
              {stats.total_products}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#6B7280",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginTop: 4,
              }}
            >
              TOTAL ITEMS
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {stats.avg_rating || "4.9"}{" "}
              <span style={{ color: "#F59E0B", fontSize: 14 }}>★</span>
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#6B7280",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginTop: 4,
              }}
            >
              RATING
            </div>
          </div>
        </div>

        {/* Butonlar — kendi profilinde gösterme */}
        {!isOwnProfile && (
          <div style={{ display: "flex", gap: 12, padding: "0 12px" }}>
            <button
              onClick={() => {
                /* chat açılacak */
              }}
              style={{
                flex: 1,
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 28,
                padding: "14px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              Mesaj Gönder
            </button>
            <button
              onClick={handleFollow}
              style={{
                flex: 1,
                background: isFollowing ? "#F3F4F6" : "#FF8C76",
                color: isFollowing ? "#374151" : "white",
                border: "none",
                borderRadius: 28,
                padding: "14px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isFollowing ? "Takip Ediliyor" : "Takip Et"}
            </button>
          </div>
        )}

        {/* Kendi profiliyse ekstra istatistikler ve butonlar */}
        {isOwnProfile && (
          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: "1px solid #F3F4F6",
              paddingLeft: 12,
              paddingRight: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <div style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{ fontWeight: 800, fontSize: 24, color: "#231b1f" }}
                >
                  {totalLikes >= 1000
                    ? (totalLikes / 1000).toFixed(1) + "k"
                    : totalLikes || 0}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#776b6b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginTop: 4,
                  }}
                >
                  TOPLAM BEĞENİ
                </div>
              </div>
              <div style={{ width: 1, height: 42, background: "#d9d1cf" }} />
              <div style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{ fontWeight: 800, fontSize: 24, color: "#231b1f" }}
                >
                  {activeOutfitsCount || 0}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#776b6b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginTop: 4,
                  }}
                >
                  AKTİF KOMBİN
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <button
                onClick={onEditProfile}
                style={{
                  height: 56,
                  background: "#ffffff",
                  color: "#231b1f",
                  border: "1px solid #e1d8d5",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                Profili Düzenle
              </button>
              <button
                onClick={onShowBoost}
                style={{
                  height: 56,
                  background: "#f68a7d",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(246, 138, 125, 0.25)",
                }}
              >
                Boost Profile
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ürünler grid */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 800,
              color: "#1F2937",
            }}
          >
            Yeni Gelenler
          </h3>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#FF8C76",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            TÜMÜNÜ GÖR
          </span>
        </div>
        {loading ? (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: 32 }}>
            Yükleniyor...
          </p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: 32 }}>
            Henüz ürün yok
          </p>
        ) : (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {products.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                getMainImage={getMainImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ortalama puan profilde sadece gösterilir, yıldız verme ürün kartından yapılır */}

      <div style={{ height: 80 }} />
    </div>
  );
};

const ProductGridCard = ({ product, getMainImage }) => {
  const handleGoToProduct = async () => {
    if (!product.product_url) return;
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: product.product_url });
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <img
        src={getMainImage(product)}
        alt={product.caption}
        style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }}
      />
      <div style={{ padding: "16px 14px" }}>
        {product.product_price && (
          <p
            style={{
              margin: "0 0 6px",
              fontWeight: 800,
              fontSize: 16,
              color: "#111827",
            }}
          >
            {product.product_price} TL
          </p>
        )}
        <button
          onClick={handleGoToProduct}
          style={{
            width: "100%",
            background: "none",
            color: "#FF8C76",
            border: "none",
            padding: 0,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 6,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {product.product_price && parseInt(product.product_price) > 500
            ? "Satın Al"
            : "Ürüne Git"}
        </button>
      </div>
    </div>
  );
};

export default BoutiqueProfile;
