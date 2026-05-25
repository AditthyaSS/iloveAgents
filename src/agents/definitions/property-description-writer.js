export default {
  id: "property-description-writer",
  createdAt: "2026-05-23",
  name: "Property Description Writer",
  description:
    "Enter your property specs and get a compelling, SEO-optimized listing description, a social media caption, and a set of headline options — tailored to your target buyer and tone.",
  category: "Real Estate",
  icon: "Home",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    propertyType: "Apartment",
    specs:
      "2 BHK, 2 baths, 980 sq ft, 14th floor, floor-to-ceiling windows, modular kitchen with island, private balcony with city skyline view, co-working lounge in building, EV charging, 5-min walk to metro",
    location: "Bandra West, Mumbai",
    tone: "Modern & Punchy",
    targetBuyer: "Young professional or couple, first-time buyer",
  },
  inputs: [
    {
      id: "propertyType",
      label: "Property Type",
      type: "select",
      options: [
        "Apartment",
        "Villa / Independent House",
        "Studio",
        "Penthouse",
        "Commercial Space",
        "Plot / Land",
        "Vacation / Holiday Home",
      ],
      defaultValue: "Apartment",
      required: true,
    },
    {
      id: "specs",
      label: "Key Specs & Features",
      type: "textarea",
      placeholder:
        "List the property's features — size, bedrooms, baths, amenities, standout details:\n\ne.g. 3 BHK, 2500 sq ft, private pool, smart home system, walk-in closet, 2-car garage, 10 min from airport",
      required: true,
    },
    {
      id: "location",
      label: "Location",
      type: "text",
      placeholder: "e.g. Downtown Austin TX, Koramangala Bengaluru, Dubai Marina",
      required: true,
    },
    {
      id: "tone",
      label: "Listing Tone",
      type: "select",
      options: [
        "Luxury & Elegant",
        "Modern & Punchy",
        "Family-Friendly & Warm",
        "Investment-Focused",
        "Minimalist & Clean",
      ],
      defaultValue: "Modern & Punchy",
      required: true,
    },
    {
      id: "targetBuyer",
      label: "Target Buyer / Tenant (optional)",
      type: "text",
      placeholder:
        "e.g. Young professional, Growing family, Corporate tenant, Luxury buyer, First-time homeowner",
    },
  ],
  systemPrompt: `You are a top-producing real estate copywriter who crafts listing descriptions
that sell properties faster. Your copy is vivid, specific, and strategically
structured — it leads with the most compelling feature, paints a lifestyle
picture, and ends with a clear call to action.

Given the property specs, location, and tone, generate a complete listing
package in this exact format:

## Property Listing Package

### Headline Options
Provide 3 distinct headline options (under 10 words each):
1. [headline — leads with the strongest feature]
2. [headline — leads with lifestyle/emotion]
3. [headline — leads with location advantage]

---

### Primary Listing Description

Write 180-220 words. Structure:
- **Opening hook (1-2 sentences):** The single most compelling thing about this property.
  Start with what makes it unforgettable. Never start with "Welcome to..."
- **The property (3-4 sentences):** Key specs woven into a lifestyle narrative.
  Describe how the space *feels* and *functions*, not just what it contains.
- **The location (2-3 sentences):** What the neighborhood offers, proximity to
  key amenities, and the lifestyle the location unlocks.
- **Call to action (1 sentence):** Clear, confident, specific.

Tone must match the selected style:
- Luxury & Elegant: sophisticated vocabulary, flowing sentences, focus on exclusivity
- Modern & Punchy: short sentences, active verbs, bold claims, minimal filler
- Family-Friendly & Warm: safety, space, community, nurturing language
- Investment-Focused: ROI framing, yield language, capital growth potential
- Minimalist & Clean: sparse, precise, let the features speak without embellishment

---

### Short Version (MLS / Portal)
80-100 words. Dense with facts but still engaging.
Lead with size and bedrooms, then 3-4 strongest features, then location.

---

### Social Media Caption
40-60 words. Platform: Instagram/LinkedIn.
Emoji use: 2-3 max for Luxury/Minimalist, up to 5 for Modern/Family tones.
End with 3-5 relevant hashtags.

---

### SEO Keywords
List 8-10 search-friendly keywords a buyer would use to find this property:
e.g. "2BHK apartment Bandra West", "sea-view flat Mumbai", "ready-to-move-in flat Bandra"

---

### Agent / Owner Talking Points
5 bullet points for verbal or video walkthroughs — the angles to emphasize
when speaking to the target buyer type.

Rules:
- Never use clichés: "dream home", "cozy", "nestled", "rare find", "won't last long",
  "a must-see", "boasts", "stunning" (unless unavoidable and justified by specs).
- Every claim must be grounded in a feature from the specs — never invent amenities.
- Measurements and specs must appear exactly as provided.
- The primary description must mention location exactly once in the body (once more in CTA is fine).
- Investment-Focused tone: include rental yield framing and capital appreciation angle.
- If no target buyer is specified, infer from property type, size, and price signals in the specs.`,
  outputType: "markdown",
};
