import { useMemo, useState } from "react";

const modules = [
  {
    id: "flexibility",
    title: "01. Flexibility Training",
    subtitle: "Linh hoạt & giải phóng mô cơ",
    badge: "ROM • SMR • Stretching",
    summary:
      "Huấn luyện linh hoạt giúp hệ thần kinh cho phép cơ, gân và mô liên kết đi qua toàn bộ biên độ vận động một cách an toàn. Đây là nền móng trước khi tăng tải, tăng tốc hoặc tăng độ phức tạp bài tập.",
    points: [
      {
        name: "SMR - Self-Myofascial Release",
        desc: "Dùng foam roller tạo áp lực lên điểm căng cứng/trigger point để hỗ trợ cơ chế ức chế tự sinh, giúp mô cơ nhả căng trước khi kéo giãn hoặc tập chính.",
        cue: "Giữ áp lực tại điểm căng tối thiểu 30 giây, thở chậm, không lăn quá nhanh."
      },
      {
        name: "Static Stretching",
        desc: "Kéo giãn tĩnh nhóm cơ bị rút ngắn hoặc hoạt động quá mức, thường áp dụng sau đánh giá tư thế như OHSA.",
        cue: "Giữ ở mức căng chịu được, không giật nảy, tối thiểu 30 giây."
      },
      {
        name: "Dynamic Stretching",
        desc: "Dùng chuyển động chủ động đưa khớp qua biên độ vận động để làm nóng, tăng tuần hoàn và chuẩn bị hệ thần kinh trước buổi tập.",
        cue: "Biên độ tăng dần, kiểm soát thân người, không đánh đổi kỹ thuật lấy tốc độ."
      }
    ],
    coaching: [
      "Xác định nhóm cơ overactive trước khi chọn kỹ thuật.",
      "SMR và static phù hợp giai đoạn chuẩn bị/corrective.",
      "Dynamic stretching phù hợp trước bài tập chính khi cơ thể đã được làm nóng nhẹ."
    ],
    mistakes: ["Lăn quá nhanh", "Kéo giãn đến mức đau", "Bỏ qua đánh giá tư thế", "Dùng dynamic quá mạnh khi chưa khởi động"],
    exercises: ["Foam Roll Calves", "Foam Roll IT Band", "Standing Hip Flexor Stretch", "Walking Lunge with Reach", "Leg Swings"]
  },
  {
    id: "core",
    title: "02. Core Training",
    subtitle: "Ổn định trung tâm lực LPHC",
    badge: "LPHC • Stability • Power",
    summary:
      "Core là phức hợp thắt lưng - chậu - hông, đóng vai trò trung tâm truyền lực. Core yếu làm lực bị thất thoát, giảm hiệu suất và tăng nguy cơ chấn thương khi tập kháng lực, plyometric hoặc đổi hướng.",
    points: [
      {
        name: "Core Stabilization",
        desc: "Tập trung vào khả năng giữ cột sống và xương chậu ổn định trong khi tay/chân chuyển động hoặc cơ thể chịu tải.",
        cue: "Giữ xương sườn hạ, siết nhẹ bụng, không võng lưng."
      },
      {
        name: "Core Strength",
        desc: "Cho phép thân người gập, duỗi, nghiêng, xoay có kiểm soát để tăng sức mạnh vùng trung tâm.",
        cue: "Chuyển động từ thân, không kéo cổ, không dùng quán tính."
      },
      {
        name: "Core Power",
        desc: "Tạo lực nhanh qua thân người, đặc biệt trong chuyển động xoay, ném, bật hoặc đổi hướng tốc độ cao.",
        cue: "Tạo lực nhanh nhưng dừng lực gọn, không mất kiểm soát cột sống."
      }
    ],
    coaching: [
      "Người mới ưu tiên ổn định trước sức mạnh.",
      "Không cho khách hàng tập core bùng nổ nếu plank cơ bản còn võng lưng.",
      "Theo dõi nhịp thở: nín thở kéo dài thường làm mất kiểm soát thân người."
    ],
    mistakes: ["Võng thắt lưng", "Rướn cổ", "Xoay thân bằng quán tính", "Chọn bài quá khó sớm"],
    exercises: ["Plank", "Floor Bridge", "Dead Bug", "Cable Rotation", "Medicine Ball Rotational Throw"]
  },
  {
    id: "balance",
    title: "03. Balance Training",
    subtitle: "Thăng bằng & cảm nhận bản thể",
    badge: "Proprioception • Control",
    summary:
      "Huấn luyện thăng bằng giúp hệ thần kinh nhận biết vị trí cơ thể trong không gian, kiểm soát khớp tốt hơn và duy trì trục vận động khi chịu tải hoặc chuyển hướng.",
    points: [
      {
        name: "Ổn định nền tảng",
        desc: "Bắt đầu trên bề mặt cứng, hai chân hoặc một chân, ưu tiên kiểm soát gối - hông - cổ chân.",
        cue: "Gối đi theo hướng mũi chân, bàn chân bám sàn, mắt nhìn ổn định."
      },
      {
        name: "Tăng thử thách",
        desc: "Tiến dần sang một chân, chuyển động tay/chân, rồi bề mặt kém ổn định như balance pad hoặc BOSU.",
        cue: "Chỉ tăng độ khó khi khách hàng giữ được kỹ thuật tối thiểu 20-30 giây."
      },
      {
        name: "Ứng dụng vận động",
        desc: "Từ giữ tĩnh sang squat một chân, reach, hop hoặc chuyển hướng để chuẩn bị cho vận động thực tế.",
        cue: "Giảm tốc êm, không để đầu gối sụp vào trong."
      }
    ],
    coaching: [
      "Không dùng mặt phẳng không ổn định cho bài nặng khi mục tiêu là tăng sức mạnh tối đa.",
      "Quan sát cổ chân, đầu gối và xương chậu đồng thời.",
      "Ưu tiên chất lượng tiếp đất hơn số lần lặp."
    ],
    mistakes: ["Gối valgus", "Mắt nhìn xuống liên tục", "Mất trục hông", "Tăng độ khó quá nhanh"],
    exercises: ["Single-Leg Balance", "Single-Leg Balance Reach", "Single-Leg Squat", "BOSU Balance", "Single-Leg Hop with Stabilization"]
  },
  {
    id: "plyometric",
    title: "04. Plyometric Training",
    subtitle: "Phản xạ bùng nổ & giảm tốc an toàn",
    badge: "SSC • Landing • Power",
    summary:
      "Plyometric khai thác chu kỳ kéo giãn - co rút để tạo lực nhanh. Đây là nhóm bài mạnh, cần dạy khách hàng biết tiếp đất, giảm tốc và ổn định trước khi bật nhảy liên tục.",
    points: [
      {
        name: "Plyo-Stabilization",
        desc: "Học cách tiếp đất và giữ tư thế 3-5 giây để kiểm soát lực tác động lên cổ chân, gối, hông và cột sống.",
        cue: "Tiếp đất mềm, hông ra sau, gối theo mũi chân, thân người vững."
      },
      {
        name: "Plyo-Strength",
        desc: "Tăng khả năng hấp thụ và sinh lực với các bài nhảy có kiểm soát, giảm thời gian dừng nhưng vẫn giữ kỹ thuật.",
        cue: "Nảy có chủ đích, không để tiếng tiếp đất quá lớn."
      },
      {
        name: "Plyo-Power",
        desc: "Tối ưu tốc độ tạo lực, phù hợp người đã có nền tảng sức mạnh, thăng bằng và kỹ thuật tiếp đất tốt.",
        cue: "Tốc độ cao nhưng form không vỡ. Dừng bài khi mất kiểm soát."
      }
    ],
    coaching: [
      "Không dùng plyometric nặng cho người mới chưa kiểm soát được squat cơ bản.",
      "Bài nhảy cần khoảng nghỉ đủ để giữ chất lượng thần kinh cơ.",
      "Ưu tiên biên độ thấp trước khi tăng độ cao hoặc tốc độ."
    ],
    mistakes: ["Tiếp đất cứng", "Gối đổ vào trong", "Nhảy quá cao quá sớm", "Không giữ pha ổn định"],
    exercises: ["Squat Jump with Stabilization", "Box Jump", "Lateral Hop", "Tuck Jump", "Medicine Ball Chest Pass"]
  },
  {
    id: "saq",
    title: "05. SAQ Training",
    subtitle: "Speed • Agility • Quickness",
    badge: "Reaction • Direction • Speed",
    summary:
      "SAQ rèn hệ thần kinh cơ phản ứng nhanh, di chuyển hiệu quả, tăng tốc, giảm tốc và đổi hướng mà vẫn giữ tư thế an toàn. Không chỉ dành cho vận động viên, SAQ còn hữu ích cho phản xạ đời sống.",
    points: [
      {
        name: "Speed",
        desc: "Khả năng di chuyển trên đường thẳng nhanh nhất có thể, nhấn mạnh tư thế thân người và nhịp chân.",
        cue: "Thân hơi nghiêng, tay đánh gọn, bước chân nhanh và chủ động."
      },
      {
        name: "Agility",
        desc: "Khả năng tăng tốc, giảm tốc, ổn định và đổi hướng nhanh mà không mất trục khớp.",
        cue: "Hạ trọng tâm khi đổi hướng, mắt nhìn điểm đến, chân phanh chắc."
      },
      {
        name: "Quickness",
        desc: "Khả năng phản ứng trong thời gian ngắn với tín hiệu thị giác, âm thanh hoặc tình huống bất ngờ.",
        cue: "Phản ứng nhanh nhưng phải dừng được, không lao người mất kiểm soát."
      }
    ],
    coaching: [
      "Cho khách hàng học giảm tốc trước khi đổi hướng tốc độ cao.",
      "Dùng cự ly ngắn, chất lượng cao, nghỉ đủ.",
      "Không biến SAQ thành cardio hỗn loạn."
    ],
    mistakes: ["Bước chân quá dài", "Thân người đổ mất kiểm soát", "Không giảm tốc", "Tập quá mệt làm hỏng kỹ thuật"],
    exercises: ["Ladder Drill", "Cone Shuffle", "Backpedal", "Zig-Zag Run", "Reactive Ball Drop"]
  },
  {
    id: "resistance",
    title: "06. Resistance Training",
    subtitle: "Kháng lực & kiểm soát chuyển động",
    badge: "Load • Tempo • Form",
    summary:
      "Tập kháng lực là trụ cột để tăng cơ, giảm mỡ, cải thiện sức mạnh và thay đổi thành phần cơ thể. Tinh thần cốt lõi: làm chủ tư thế trước khi tăng tạ.",
    points: [
      {
        name: "Máy móc - Machines",
        desc: "Phù hợp người mới vì quỹ đạo chuyển động ổn định, giúp học cảm giác cơ và giảm rủi ro sai trục ban đầu.",
        cue: "Chỉnh ghế, tay cầm và biên độ theo cơ thể khách hàng trước khi tăng tải."
      },
      {
        name: "Tạ tự do - Free Weights",
        desc: "Đòi hỏi kiểm soát core, khớp vai, hông, gối và cổ chân tốt hơn. Hiệu quả cao nhưng yêu cầu kỹ thuật nghiêm ngặt.",
        cue: "Tăng tải sau khi khách hàng giữ được đường đi tạ ổn định."
      },
      {
        name: "Tempo",
        desc: "Nhịp độ kiểm soát pha hạ, pha giữ và pha nâng. Ví dụ ổn định dùng nhịp chậm; sức mạnh dùng nhịp cân bằng hơn.",
        cue: "Đếm tempo rõ. Không để khách hàng thả tạ rơi tự do."
      }
    ],
    coaching: [
      "Với seated row: vai không rụt, cổ dài, bả vai kéo về sau và xuống.",
      "Với incline dumbbell press: kiểm soát khớp vai, không mở khuỷu quá rộng, không bật tạ bằng quán tính.",
      "Tăng tải theo nguyên tắc: đúng form → đủ biên độ → ổn định tempo → mới tăng kg."
    ],
    mistakes: ["Tăng tạ khi form chưa chắc", "Thả tạ quá nhanh", "Rụt vai", "Không chỉnh máy theo người tập"],
    exercises: ["Machine Row", "Incline Dumbbell Press", "Goblet Squat", "Romanian Deadlift", "Lat Pulldown"]
  }
];

const optPhases = [
  { phase: "Phase 1", name: "Stabilization Endurance", focus: "Ổn định, kiểm soát, sửa lỗi chuyển động", tempo: "4-2-1", color: "#111111" },
  { phase: "Phase 2", name: "Strength Endurance", focus: "Sức bền sức mạnh, superset ổn định + sức mạnh", tempo: "2-0-2", color: "#b31217" },
  { phase: "Phase 3", name: "Muscular Development", focus: "Tăng cơ, tăng volume, kiểm soát tải", tempo: "2-0-2", color: "#111111" },
  { phase: "Phase 4", name: "Maximal Strength", focus: "Sức mạnh tối đa, tải cao, nghỉ dài", tempo: "X-X-X", color: "#b31217" },
  { phase: "Phase 5", name: "Power", focus: "Tốc độ tạo lực, ghép strength + power", tempo: "X-X-X", color: "#111111" }
];

const lessonPlan = [
  "Đánh giá tư thế và năng lực vận động ban đầu.",
  "Chọn kỹ thuật phù hợp theo mục tiêu: linh hoạt, core, thăng bằng, plyometric, SAQ hoặc kháng lực.",
  "Dạy kỹ thuật bằng cue ngắn: vị trí khớp, nhịp thở, tempo, biên độ.",
  "Quan sát lỗi chính và sửa ngay trong set đầu tiên.",
  "Ghi lại bài tập, mức tải, RPE, lỗi kỹ thuật và phản ứng của khách hàng.",
  "Tăng tiến khi khách hàng đạt form ổn định, không đau, không mất kiểm soát."
];

const techniqueCategories = [
  "Tất cả",
  "Mobility",
  "Flexibility",
  "SMR",
  "Core",
  "Balance",
  "Resistance",
  "Plyometric",
  "SAQ",
  "Corrective",
  "Recovery",
  "Shoulder",
  "Spine",
  "Hip",
  "Knee",
  "Ankle",
  "Upper Body",
  "Lower Body"
];

const techniques150 = [
  { no: 1, name: "Foam Roll Calves", category: "SMR", region: "Cẳng chân / cổ chân", goal: "Giảm căng cơ bắp chân, hỗ trợ dorsiflexion", cue: "Lăn chậm, dừng tại điểm căng 30 giây." },
  { no: 2, name: "Foam Roll Hamstrings", category: "SMR", region: "Đùi sau", goal: "Giảm căng chuỗi sau", cue: "Không lăn trực tiếp sau gối." },
  { no: 3, name: "Foam Roll Quadriceps", category: "SMR", region: "Đùi trước / gối", goal: "Giảm căng cơ đùi trước", cue: "Giữ bụng nhẹ, không võng lưng." },
  { no: 4, name: "Foam Roll IT Band", category: "SMR", region: "Đùi ngoài / hông / gối", goal: "Giảm căng vùng đùi ngoài", cue: "Áp lực vừa phải, tránh đau sắc." },
  { no: 5, name: "Foam Roll Adductors", category: "SMR", region: "Đùi trong / hông", goal: "Giảm căng cơ khép", cue: "Gập hông 90 độ, lăn ngắn và chậm." },
  { no: 6, name: "Foam Roll Glutes", category: "SMR", region: "Mông / hông", goal: "Giảm căng mông và piriformis", cue: "Bắt chéo chân để tăng áp lực nếu phù hợp." },
  { no: 7, name: "Foam Roll Lats", category: "SMR", region: "Lưng xô / vai", goal: "Cải thiện overhead mobility", cue: "Không nén trực tiếp vào nách." },
  { no: 8, name: "Foam Roll Thoracic Spine", category: "SMR", region: "Cột sống ngực", goal: "Cải thiện duỗi ngực", cue: "Không lăn vùng thắt lưng." },
  { no: 9, name: "Lacrosse Ball Pec Release", category: "SMR", region: "Ngực / vai", goal: "Giảm căng ngực trước", cue: "Áp bóng vào tường, thở chậm." },
  { no: 10, name: "Foot Plantar Release", category: "SMR", region: "Bàn chân", goal: "Giảm căng cân gan chân", cue: "Lăn bóng dưới lòng bàn chân 60 giây." },

  { no: 11, name: "Standing Calf Stretch", category: "Flexibility", region: "Bắp chân / cổ chân", goal: "Tăng biên độ cổ chân", cue: "Gót chân chạm sàn, gối thẳng." },
  { no: 12, name: "Soleus Stretch", category: "Flexibility", region: "Cẳng chân sâu", goal: "Cải thiện gập cổ chân khi squat", cue: "Gối hơi gập, gót không nhấc." },
  { no: 13, name: "Kneeling Hip Flexor Stretch", category: "Flexibility", region: "Hông trước", goal: "Giảm anterior pelvic tilt", cue: "Siết mông bên sau, không võng lưng." },
  { no: 14, name: "Couch Stretch", category: "Flexibility", region: "Đùi trước / hông", goal: "Mở cơ gập hông và rectus femoris", cue: "Xương sườn hạ, mông siết." },
  { no: 15, name: "Seated Hamstring Stretch", category: "Flexibility", region: "Đùi sau", goal: "Tăng linh hoạt chuỗi sau", cue: "Gập từ hông, không cong lưng quá mức." },
  { no: 16, name: "Figure-4 Stretch", category: "Flexibility", region: "Mông / hông", goal: "Giãn piriformis và glute", cue: "Giữ cổ trung lập, kéo nhẹ." },
  { no: 17, name: "Adductor Rock Back", category: "Mobility", region: "Đùi trong / hông", goal: "Mở háng và cải thiện squat", cue: "Đẩy hông ra sau, lưng trung lập." },
  { no: 18, name: "Child Pose Lat Stretch", category: "Flexibility", region: "Lưng xô / vai", goal: "Tăng overhead mobility", cue: "Đẩy tay xa, thở vào lưng." },
  { no: 19, name: "Doorway Pec Stretch", category: "Flexibility", region: "Ngực / vai", goal: "Giảm vai tròn", cue: "Không đẩy đầu vai ra trước." },
  { no: 20, name: "Upper Trap Stretch", category: "Flexibility", region: "Cổ / vai", goal: "Giảm căng cổ vai", cue: "Kéo nhẹ, không vặn cổ mạnh." },

  { no: 21, name: "Ankle Wall Mobilization", category: "Mobility", region: "Cổ chân", goal: "Tăng dorsiflexion", cue: "Gối chạm tường, gót giữ sàn." },
  { no: 22, name: "90/90 Hip Switch", category: "Mobility", region: "Hông", goal: "Tăng xoay trong/xoay ngoài hông", cue: "Ngực mở, chuyển chậm." },
  { no: 23, name: "World’s Greatest Stretch", category: "Mobility", region: "Toàn thân", goal: "Mở hông, ngực, gân kheo", cue: "Chuyển từng đoạn, không vội." },
  { no: 24, name: "Cat-Cow", category: "Mobility", region: "Cột sống", goal: "Tăng nhận thức cột sống", cue: "Di chuyển từng đốt sống." },
  { no: 25, name: "Thoracic Open Book", category: "Mobility", region: "Cột sống ngực", goal: "Tăng xoay ngực", cue: "Gối giữ cố định, xoay từ ngực." },
  { no: 26, name: "Thread the Needle", category: "Mobility", region: "Vai / cột sống ngực", goal: "Mở vai và xoay thân", cue: "Thở ra khi luồn tay." },
  { no: 27, name: "Scapular Wall Slide", category: "Mobility", region: "Vai / xương bả vai", goal: "Cải thiện upward rotation", cue: "Lưng không võng, tay trượt kiểm soát." },
  { no: 28, name: "Shoulder CARs", category: "Mobility", region: "Khớp vai", goal: "Kiểm soát xoay vai", cue: "Vòng chậm, không nhún vai." },
  { no: 29, name: "Hip CARs", category: "Mobility", region: "Khớp hông", goal: "Kiểm soát ổ khớp hông", cue: "Giữ thân cố định." },
  { no: 30, name: "Wrist CARs", category: "Mobility", region: "Cổ tay", goal: "Tăng kiểm soát cổ tay", cue: "Vòng chậm, không đau." },

  { no: 31, name: "Dead Bug", category: "Core", region: "Core sâu", goal: "Ổn định cột sống", cue: "Lưng dưới áp nhẹ xuống sàn." },
  { no: 32, name: "Bird Dog", category: "Core", region: "Core / lưng", goal: "Ổn định thân khi tay chân chuyển động", cue: "Không xoay hông." },
  { no: 33, name: "Forearm Plank", category: "Core", region: "Core trước", goal: "Tăng chống duỗi cột sống", cue: "Siết mông, xương sườn hạ." },
  { no: 34, name: "Side Plank", category: "Core", region: "Core bên", goal: "Tăng chống nghiêng", cue: "Hông nâng thẳng, vai xa tai." },
  { no: 35, name: "Floor Bridge", category: "Core", region: "Mông / LPHC", goal: "Kích hoạt mông và ổn định chậu", cue: "Đẩy bằng gót, không võng lưng." },
  { no: 36, name: "Pallof Press", category: "Core", region: "Core chống xoay", goal: "Tăng anti-rotation", cue: "Không để dây kéo xoay thân." },
  { no: 37, name: "Cable Rotation", category: "Core", region: "Core xoay", goal: "Tăng sức mạnh xoay", cue: "Xoay từ thân, chân bám sàn." },
  { no: 38, name: "Stability Ball Crunch", category: "Core", region: "Bụng trước", goal: "Tập gập thân có kiểm soát", cue: "Không kéo cổ." },
  { no: 39, name: "Hanging Knee Raise", category: "Core", region: "Bụng / hông", goal: "Tăng kiểm soát gập hông", cue: "Không đung đưa người." },
  { no: 40, name: "Medicine Ball Slam", category: "Core", region: "Core power", goal: "Tạo lực toàn thân", cue: "Gập hông, không chỉ dùng tay." },

  { no: 41, name: "Single-Leg Balance", category: "Balance", region: "Cổ chân / hông", goal: "Tăng ổn định một chân", cue: "Gối theo mũi chân." },
  { no: 42, name: "Single-Leg Balance Reach", category: "Balance", region: "Hông / gối / cổ chân", goal: "Kiểm soát trục khi với tay", cue: "Hông không lệch." },
  { no: 43, name: "Single-Leg RDL Reach", category: "Balance", region: "Chuỗi sau", goal: "Thăng bằng và hip hinge", cue: "Lưng dài, hông vuông." },
  { no: 44, name: "Single-Leg Squat to Box", category: "Balance", region: "Gối / hông", goal: "Kiểm soát gối khi squat một chân", cue: "Chạm ghế nhẹ, không ngồi sập." },
  { no: 45, name: "BOSU Static Hold", category: "Balance", region: "Cổ chân", goal: "Tăng phản hồi cảm nhận bản thể", cue: "Không khóa gối." },
  { no: 46, name: "Balance Pad March", category: "Balance", region: "Cổ chân / core", goal: "Ổn định trên nền mềm", cue: "Bước chậm, thân vững." },
  { no: 47, name: "Single-Leg Hop Stabilization", category: "Balance", region: "Gối / cổ chân", goal: "Giảm tốc sau bật nhẹ", cue: "Giữ tiếp đất 3 giây." },
  { no: 48, name: "Lateral Bound Hold", category: "Balance", region: "Hông / gối", goal: "Ổn định chuyển hướng ngang", cue: "Tiếp đất mềm, hông ra sau." },
  { no: 49, name: "Star Excursion Reach", category: "Balance", region: "Chi dưới", goal: "Đánh giá và luyện kiểm soát đa hướng", cue: "Giữ chân trụ chắc." },
  { no: 50, name: "Tandem Walk", category: "Balance", region: "Toàn thân", goal: "Cải thiện thăng bằng cơ bản", cue: "Đi chậm trên một đường." },

  { no: 51, name: "Bodyweight Squat", category: "Resistance", region: "Đùi / mông", goal: "Nền tảng squat", cue: "Gối theo mũi chân, ngực mở." },
  { no: 52, name: "Goblet Squat", category: "Resistance", region: "Đùi / mông / core", goal: "Học squat có tải", cue: "Giữ tạ sát ngực." },
  { no: 53, name: "Front Squat", category: "Resistance", region: "Đùi trước / core", goal: "Tăng sức mạnh squat thân thẳng", cue: "Khuỷu nâng, thân vững." },
  { no: 54, name: "Barbell Back Squat", category: "Resistance", region: "Chi dưới", goal: "Tăng sức mạnh toàn thân", cue: "Bàn chân bám sàn, lưng trung lập." },
  { no: 55, name: "Split Squat", category: "Resistance", region: "Đùi / mông", goal: "Tăng sức mạnh từng chân", cue: "Hạ thẳng, không lao gối." },
  { no: 56, name: "Reverse Lunge", category: "Resistance", region: "Đùi / mông", goal: "Tập lunge thân thiện với gối", cue: "Bước lùi, kiểm soát hông." },
  { no: 57, name: "Walking Lunge", category: "Resistance", region: "Chi dưới", goal: "Tăng sức bền và kiểm soát", cue: "Bước đều, không đổ người." },
  { no: 58, name: "Step-Up", category: "Resistance", region: "Mông / đùi", goal: "Sức mạnh đơn chân", cue: "Đẩy qua gót chân trên bục." },
  { no: 59, name: "Leg Press", category: "Resistance", region: "Đùi / mông", goal: "Tăng tải an toàn hơn cho người mới", cue: "Không khóa gối cuối động tác." },
  { no: 60, name: "Leg Extension", category: "Resistance", region: "Đùi trước", goal: "Cô lập quadriceps", cue: "Nâng kiểm soát, không vung tạ." },
  { no: 61, name: "Lying Leg Curl", category: "Resistance", region: "Đùi sau", goal: "Tăng sức mạnh hamstring", cue: "Hông áp ghế, không bật lưng." },
  { no: 62, name: "Romanian Deadlift", category: "Resistance", region: "Đùi sau / mông", goal: "Tập hip hinge", cue: "Đẩy hông sau, lưng dài." },
  { no: 63, name: "Conventional Deadlift", category: "Resistance", region: "Chuỗi sau", goal: "Sức mạnh toàn thân", cue: "Tạ sát thân, kéo sàn bằng chân." },
  { no: 64, name: "Hip Thrust", category: "Resistance", region: "Mông", goal: "Phát triển glute", cue: "Cằm thu nhẹ, xương sườn hạ." },
  { no: 65, name: "Cable Glute Kickback", category: "Resistance", region: "Mông", goal: "Cô lập mông", cue: "Không xoay hông." },
  { no: 66, name: "Standing Calf Raise", category: "Resistance", region: "Bắp chân", goal: "Tăng sức mạnh gastrocnemius", cue: "Lên hết biên độ, hạ chậm." },
  { no: 67, name: "Seated Calf Raise", category: "Resistance", region: "Bắp chân sâu", goal: "Tăng sức mạnh soleus", cue: "Không bật nảy." },
  { no: 68, name: "Machine Seated Row", category: "Resistance", region: "Lưng giữa", goal: "Tập kéo ngang", cue: "Vai xuống, kéo bằng lưng." },
  { no: 69, name: "Lat Pulldown", category: "Resistance", region: "Lưng xô", goal: "Tập kéo dọc", cue: "Kéo khuỷu xuống, không rụt cổ." },
  { no: 70, name: "Assisted Pull-Up", category: "Resistance", region: "Lưng / tay", goal: "Xây nền kéo người", cue: "Ngực hướng lên, thân ổn định." },
  { no: 71, name: "One-Arm Dumbbell Row", category: "Resistance", region: "Lưng xô", goal: "Tăng sức mạnh kéo một bên", cue: "Không xoay thân quá mức." },
  { no: 72, name: "Barbell Row", category: "Resistance", region: "Lưng", goal: "Sức mạnh kéo ngang", cue: "Giữ hip hinge, cổ trung lập." },
  { no: 73, name: "Face Pull", category: "Resistance", region: "Vai sau / bả vai", goal: "Cân bằng vai, cải thiện tư thế", cue: "Kéo về mặt, khuỷu cao vừa." },
  { no: 74, name: "Chest Press Machine", category: "Resistance", region: "Ngực / tay sau", goal: "Đẩy ngực an toàn cho người mới", cue: "Vai không nhô trước." },
  { no: 75, name: "Push-Up", category: "Resistance", region: "Ngực / core", goal: "Sức mạnh thân trên", cue: "Thân thẳng, khuỷu 30-45 độ." },
  { no: 76, name: "Incline Push-Up", category: "Resistance", region: "Ngực / vai", goal: "Biến thể dễ hơn push-up", cue: "Tay đặt chắc, thân thẳng." },
  { no: 77, name: "Dumbbell Bench Press", category: "Resistance", region: "Ngực", goal: "Tăng sức mạnh đẩy", cue: "Cổ tay thẳng, vai ổn định." },
  { no: 78, name: "Incline Dumbbell Press", category: "Resistance", region: "Ngực trên / vai", goal: "Phát triển ngực trên", cue: "Không mở khuỷu quá rộng." },
  { no: 79, name: "Cable Chest Fly", category: "Resistance", region: "Ngực", goal: "Cô lập ngực", cue: "Ôm vòng cung, không khóa khuỷu." },
  { no: 80, name: "Overhead Press", category: "Resistance", region: "Vai", goal: "Sức mạnh đẩy dọc", cue: "Siết core, không ưỡn lưng." },
  { no: 81, name: "Dumbbell Lateral Raise", category: "Resistance", region: "Vai giữa", goal: "Phát triển vai ngang", cue: "Nâng bằng khuỷu, không nhún vai." },
  { no: 82, name: "Rear Delt Fly", category: "Resistance", region: "Vai sau", goal: "Cân bằng vai", cue: "Mở tay bằng vai sau, không vung." },
  { no: 83, name: "Cable External Rotation", category: "Resistance", region: "Rotator cuff", goal: "Ổn định chóp xoay", cue: "Khuỷu sát thân, xoay chậm." },
  { no: 84, name: "Biceps Curl", category: "Resistance", region: "Tay trước", goal: "Tăng sức mạnh biceps", cue: "Khuỷu đứng yên." },
  { no: 85, name: "Hammer Curl", category: "Resistance", region: "Tay trước / cẳng tay", goal: "Tăng brachialis", cue: "Cổ tay trung lập." },
  { no: 86, name: "Triceps Rope Pushdown", category: "Resistance", region: "Tay sau", goal: "Tăng triceps", cue: "Khuỷu sát thân, ép cuối động tác." },
  { no: 87, name: "Overhead Triceps Extension", category: "Resistance", region: "Tay sau", goal: "Tập đầu dài triceps", cue: "Không ưỡn lưng." },
  { no: 88, name: "Farmer Carry", category: "Resistance", region: "Grip / core", goal: "Sức mạnh nắm và core", cue: "Đi thẳng, vai thấp." },
  { no: 89, name: "Suitcase Carry", category: "Resistance", region: "Core bên", goal: "Chống nghiêng thân", cue: "Không lệch người về phía tạ." },
  { no: 90, name: "Sled Push", category: "Resistance", region: "Toàn thân", goal: "Sức mạnh chân và conditioning", cue: "Thân nghiêng, bước ngắn mạnh." },

  { no: 91, name: "Squat Jump Stabilization", category: "Plyometric", region: "Chi dưới", goal: "Học tiếp đất", cue: "Giữ 3 giây sau khi tiếp đất." },
  { no: 92, name: "Box Jump", category: "Plyometric", region: "Chi dưới", goal: "Tăng power", cue: "Tiếp đất mềm trên hộp." },
  { no: 93, name: "Depth Drop", category: "Plyometric", region: "Gối / cổ chân", goal: "Học hấp thụ lực", cue: "Rơi xuống và giữ form." },
  { no: 94, name: "Lateral Hop Stabilization", category: "Plyometric", region: "Hông / gối", goal: "Giảm tốc ngang", cue: "Không để gối sụp vào trong." },
  { no: 95, name: "Tuck Jump", category: "Plyometric", region: "Toàn thân", goal: "Power nâng cao", cue: "Dừng khi tiếp đất ồn hoặc mất trục." },
  { no: 96, name: "Medicine Ball Chest Pass", category: "Plyometric", region: "Ngực / tay", goal: "Power thân trên", cue: "Ném mạnh, thân vững." },
  { no: 97, name: "Medicine Ball Rotational Throw", category: "Plyometric", region: "Core xoay", goal: "Power xoay", cue: "Xoay hông và thân cùng nhau." },
  { no: 98, name: "Skater Jump", category: "Plyometric", region: "Hông / đùi", goal: "Power chuyển hướng", cue: "Tiếp đất một chân kiểm soát." },
  { no: 99, name: "Broad Jump", category: "Plyometric", region: "Chi dưới", goal: "Tạo lực ngang", cue: "Đẩy hông mạnh, tiếp đất mềm." },
  { no: 100, name: "Pogo Jump", category: "Plyometric", region: "Cổ chân", goal: "Đàn hồi cổ chân", cue: "Gối mềm, bật nhanh thấp." },

  { no: 101, name: "Marching A-Drill", category: "SAQ", region: "Chạy / hông", goal: "Kỹ thuật bước chạy", cue: "Gối nâng, bàn chân chủ động." },
  { no: 102, name: "A-Skip", category: "SAQ", region: "Chạy", goal: "Nhịp chân và phản xạ", cue: "Tiếp đất dưới hông." },
  { no: 103, name: "High Knees", category: "SAQ", region: "Hông / core", goal: "Tốc độ chân", cue: "Thân cao, tay đánh nhanh." },
  { no: 104, name: "Butt Kicks", category: "SAQ", region: "Đùi sau", goal: "Nhịp chạy", cue: "Không ngả lưng sau." },
  { no: 105, name: "Ladder In-In-Out-Out", category: "SAQ", region: "Chân / phản xạ", goal: "Tốc độ bàn chân", cue: "Bước nhẹ, mắt nhìn trước." },
  { no: 106, name: "Ladder Lateral Shuffle", category: "SAQ", region: "Hông / chân", goal: "Di chuyển ngang", cue: "Hạ trọng tâm." },
  { no: 107, name: "Cone Sprint", category: "SAQ", region: "Toàn thân", goal: "Tăng tốc đường thẳng", cue: "Bước đầu mạnh." },
  { no: 108, name: "5-10-5 Shuttle", category: "SAQ", region: "Đổi hướng", goal: "Agility", cue: "Giảm tốc trước khi quay." },
  { no: 109, name: "Zig-Zag Cone Run", category: "SAQ", region: "Đổi hướng", goal: "Kiểm soát agility", cue: "Đổi hướng bằng hông và chân ngoài." },
  { no: 110, name: "Reactive Ball Drop", category: "SAQ", region: "Phản xạ", goal: "Quickness", cue: "Phản ứng nhanh, giữ an toàn." },

  { no: 111, name: "Glute Activation Clamshell", category: "Corrective", region: "Mông giữa / hông", goal: "Kích hoạt glute med", cue: "Không xoay hông ra sau." },
  { no: 112, name: "Mini Band Lateral Walk", category: "Corrective", region: "Hông / gối", goal: "Ổn định gối valgus", cue: "Mũi chân thẳng, gối mở nhẹ." },
  { no: 113, name: "Monster Walk", category: "Corrective", region: "Hông", goal: "Kích hoạt mông", cue: "Bước chéo vừa, không lắc thân." },
  { no: 114, name: "Wall Angel", category: "Corrective", region: "Vai / lưng trên", goal: "Cải thiện vai tròn", cue: "Lưng và đầu sát tường nếu có thể." },
  { no: 115, name: "Chin Tuck", category: "Corrective", region: "Cổ", goal: "Giảm đầu đưa trước", cue: "Thu cằm thẳng ra sau, không cúi đầu." },
  { no: 116, name: "Scapular Push-Up", category: "Corrective", region: "Bả vai", goal: "Kiểm soát protraction/retraction", cue: "Khuỷu thẳng, chỉ di chuyển bả vai." },
  { no: 117, name: "Band Pull-Apart", category: "Corrective", region: "Vai sau / lưng trên", goal: "Cân bằng tư thế thân trên", cue: "Vai thấp, kéo ngang ngực." },
  { no: 118, name: "Y-T-W Raise", category: "Corrective", region: "Bả vai / vai sau", goal: "Tăng kiểm soát scapula", cue: "Nâng nhẹ, không nhún vai." },
  { no: 119, name: "Terminal Knee Extension", category: "Corrective", region: "Gối", goal: "Kích hoạt VMO và kiểm soát gối", cue: "Duỗi gối có kiểm soát." },
  { no: 120, name: "Short Foot Drill", category: "Corrective", region: "Bàn chân", goal: "Tăng vòm chân", cue: "Kéo gốc ngón chân về gót, không co ngón." },

  { no: 121, name: "Diaphragmatic Breathing", category: "Recovery", region: "Hô hấp / core", goal: "Giảm căng, cải thiện kiểm soát core", cue: "Hít vào bụng và sườn, thở chậm." },
  { no: 122, name: "Crocodile Breathing", category: "Recovery", region: "Hô hấp / lưng", goal: "Cảm nhận hơi thở 360 độ", cue: "Nằm sấp, thở vào ép bụng xuống sàn." },
  { no: 123, name: "Box Breathing", category: "Recovery", region: "Thần kinh", goal: "Hạ nhịp căng thẳng", cue: "Hít 4, giữ 4, thở 4, giữ 4." },
  { no: 124, name: "Legs Up The Wall", category: "Recovery", region: "Tuần hoàn / chân", goal: "Thư giãn sau tập", cue: "Nằm thoải mái 3-5 phút." },
  { no: 125, name: "Supine Spinal Twist", category: "Recovery", region: "Cột sống", goal: "Thư giãn lưng", cue: "Không ép gối xuống bằng lực mạnh." },
  { no: 126, name: "Child Pose Breathing", category: "Recovery", region: "Lưng / vai", goal: "Giảm căng lưng", cue: "Thở vào vùng lưng sau." },
  { no: 127, name: "Light Zone 2 Walk", category: "Recovery", region: "Tim mạch", goal: "Phục hồi chủ động", cue: "Giữ nhịp dễ nói chuyện." },
  { no: 128, name: "Post-Workout Mobility Flow", category: "Recovery", region: "Toàn thân", goal: "Hạ nhiệt và duy trì ROM", cue: "Chậm, không cố kéo đau." },
  { no: 129, name: "Contrast Shower Protocol", category: "Recovery", region: "Phục hồi chung", goal: "Tạo cảm giác tỉnh và thư giãn", cue: "Không dùng khi có chống chỉ định y tế." },
  { no: 130, name: "Sleep Wind-Down Stretch", category: "Recovery", region: "Thần kinh / cơ", goal: "Chuẩn bị ngủ", cue: "Ánh sáng thấp, thở chậm." },

  { no: 131, name: "Shoulder Dislocates with Band", category: "Shoulder", region: "Vai", goal: "Tăng linh hoạt vai", cue: "Tay rộng, không ép đau." },
  { no: 132, name: "Serratus Wall Slide", category: "Shoulder", region: "Bả vai", goal: "Kích hoạt serratus anterior", cue: "Đẩy nhẹ cẳng tay vào tường." },
  { no: 133, name: "Prone Cobra", category: "Shoulder", region: "Lưng trên / vai", goal: "Cải thiện tư thế vai", cue: "Xoay ngón cái lên, cổ dài." },
  { no: 134, name: "External Rotation 90/90", category: "Shoulder", region: "Rotator cuff", goal: "Ổn định vai nâng cao", cue: "Không bù bằng lưng." },
  { no: 135, name: "Landmine Press", category: "Shoulder", region: "Vai / core", goal: "Đẩy vai thân thiện hơn overhead", cue: "Đẩy theo đường chéo, core vững." },

  { no: 136, name: "McGill Curl-Up", category: "Spine", region: "Cột sống thắt lưng", goal: "Core ổn định, hạn chế gập lưng quá mức", cue: "Nâng nhẹ đầu vai, không cuộn mạnh." },
  { no: 137, name: "Modified Side Plank", category: "Spine", region: "Cột sống / core bên", goal: "Ổn định thân bên", cue: "Bắt đầu từ gối nếu yếu." },
  { no: 138, name: "Hip Hinge Dowel Drill", category: "Spine", region: "Cột sống / hông", goal: "Học hinge giữ lưng trung lập", cue: "Gậy chạm đầu, lưng, xương cụt." },
  { no: 139, name: "Quadruped Rock Back", category: "Spine", region: "Hông / lưng", goal: "Tập gập hông không cong lưng", cue: "Đẩy hông sau, lưng dài." },
  { no: 140, name: "Thoracic Extension on Bench", category: "Spine", region: "Cột sống ngực", goal: "Mở ngực, hỗ trợ overhead", cue: "Không ép thắt lưng." },

  { no: 141, name: "Hip Airplane Assisted", category: "Hip", region: "Hông", goal: "Kiểm soát xoay hông", cue: "Bám tường, xoay chậm." },
  { no: 142, name: "Banded Hip Distraction", category: "Hip", region: "Khớp hông", goal: "Tạo không gian khớp, hỗ trợ mobility", cue: "Dây kéo nhẹ, không đau." },
  { no: 143, name: "Frog Stretch", category: "Hip", region: "Háng / hông", goal: "Mở adductor", cue: "Đệm gối, hạ chậm." },
  { no: 144, name: "Copenhagen Plank Regression", category: "Hip", region: "Adductor", goal: "Tăng sức mạnh cơ khép", cue: "Bắt đầu gối trên ghế, giữ ngắn." },
  { no: 145, name: "Hip Flexor March with Band", category: "Hip", region: "Hông trước", goal: "Tăng sức mạnh gập hông", cue: "Không nghiêng thân." },

  { no: 146, name: "Spanish Squat", category: "Knee", region: "Gối / đùi trước", goal: "Tăng chịu tải gối có kiểm soát", cue: "Thân thẳng, ngồi ra sau dây." },
  { no: 147, name: "Step-Down", category: "Knee", region: "Gối / hông", goal: "Kiểm soát gối khi xuống bậc", cue: "Chạm gót nhẹ, gối không sụp." },
  { no: 148, name: "Tibialis Raise", category: "Ankle", region: "Cẳng chân trước", goal: "Tăng kiểm soát cổ chân", cue: "Lưng tựa tường, kéo mũi chân lên." },
  { no: 149, name: "Single-Leg Calf Eccentric", category: "Ankle", region: "Gân Achilles / bắp chân", goal: "Tăng kiểm soát hạ gót", cue: "Hạ 3 giây, không bật nảy." },
  { no: 150, name: "Toe Yoga", category: "Ankle", region: "Bàn chân", goal: "Kiểm soát ngón và vòm chân", cue: "Tách ngón cái và 4 ngón còn lại." }
];

function App() {
  const [activeId, setActiveId] = useState("flexibility");
  const [goal, setGoal] = useState("Giảm mỡ, giữ cơ, nữ 37 tuổi, tập 3 buổi/tuần");
  const [diet, setDiet] = useState("Không ăn quá cay, ưu tiên thực đơn Việt Nam, dễ nấu, chi phí vừa phải");
  const [menuResult, setMenuResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [techniqueQuery, setTechniqueQuery] = useState("");
  const [techniqueCategory, setTechniqueCategory] = useState("Tất cả");

  const active = useMemo(() => modules.find((item) => item.id === activeId), [activeId]);

  const filteredTechniques = useMemo(() => {
    const keyword = techniqueQuery.trim().toLowerCase();
    return techniques150.filter((item) => {
      const matchCategory = techniqueCategory === "Tất cả" || item.category === techniqueCategory;
      const text = `${item.name} ${item.category} ${item.region} ${item.goal} ${item.cue}`.toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [techniqueQuery, techniqueCategory]);

  async function handleGenerateMenu() {
    setLoading(true);
    setMenuResult("");

    try {
      const response = await fetch("/api/menu-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, diet })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Không gọi được AI API");
      setMenuResult(data.result || "AI chưa trả về nội dung.");
    } catch (error) {
      setMenuResult(
        "Chưa kết nối được API. Kiểm tra file /api/menu-ai.js và biến môi trường OPENAI_API_KEY trên Vercel.\n\nChi tiết lỗi: " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="academy-shell">
      <style>{css}</style>

      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <p className="eyebrow">Internal PT Academy</p>
            <h1>Academy</h1>
          </div>
        </div>

        <div className="sidebar-card">
          <p className="tiny-title">NASM OPT</p>
          <h2>Phần 4: Training Techniques</h2>
          <p>Biến lý thuyết thành hành động qua 6 mảng kỹ thuật huấn luyện cốt lõi.</p>
        </div>

        <nav className="module-nav">
          {modules.map((item) => (
            <button
              key={item.id}
              className={item.id === activeId ? "nav-item active" : "nav-item"}
              onClick={() => setActiveId(item.id)}
            >
              <span>{item.title}</span>
              <small>{item.subtitle}</small>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="hero">
          <div>
            <p className="eyebrow red">European Clean System</p>
            <h2>Giáo trình đào tạo PT nội bộ</h2>
            <p className="hero-copy">
              Giao diện trắng, chữ đen, điểm nhấn đỏ mạnh mẽ. Nội dung được tổ chức theo chuẩn học - hiểu - thực hành - sửa lỗi để PT dùng trực tiếp khi đào tạo và tư vấn khách hàng.
            </p>
          </div>
          <div className="hero-panel">
            <span>By Master Armin HuyTran</span>
            <strong>Part 4</strong>
            <small>Applied Training Techniques</small>
          </div>
        </header>

        <section className="grid-overview">
          {optPhases.map((phase) => (
            <article className="phase-card" key={phase.phase}>
              <span style={{ color: phase.color }}>{phase.phase}</span>
              <h3>{phase.name}</h3>
              <p>{phase.focus}</p>
              <b>Tempo: {phase.tempo}</b>
            </article>
          ))}
        </section>

        <section className="lesson-section">
          <article className="lesson-main">
            <div className="section-heading">
              <span>{active.badge}</span>
              <h2>{active.title}</h2>
              <p>{active.summary}</p>
            </div>

            <div className="point-grid">
              {active.points.map((point) => (
                <div className="point-card" key={point.name}>
                  <h3>{point.name}</h3>
                  <p>{point.desc}</p>
                  <div className="cue">Cue: {point.cue}</div>
                </div>
              ))}
            </div>

            <div className="two-col">
              <div className="info-box">
                <h3>Checklist huấn luyện</h3>
                <ul>
                  {active.coaching.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="info-box danger">
                <h3>Lỗi cần tránh</h3>
                <ul>
                  {active.mistakes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="exercise-strip">
              <h3>Bài tập gợi ý</h3>
              <div>
                {active.exercises.map((exercise) => (
                  <span key={exercise}>{exercise}</span>
                ))}
              </div>
            </div>
          </article>

          <aside className="lesson-side">
            <div className="side-panel">
              <p className="tiny-title">Internal SOP</p>
              <h3>Quy trình dạy 1 kỹ thuật</h3>
              <ol>
                {lessonPlan.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="side-panel black">
              <p className="tiny-title">PT Standard</p>
              <h3>Nguyên tắc tăng tiến</h3>
              <p>Đúng tư thế trước. Đủ biên độ sau. Kiểm soát tempo rồi mới tăng tải, tăng tốc hoặc tăng độ phức tạp.</p>
            </div>
          </aside>
        </section>

        <section className="technique-library">
          <div className="section-heading compact">
            <span>150 Training Techniques</span>
            <h2>Thư viện tra cứu kỹ thuật tập luyện</h2>
            <p>Danh sách 150 kỹ thuật/bài tập được phân nhóm theo mobility, flexibility, SMR, core, balance, resistance, plyometric, SAQ, corrective, phục hồi và các vùng khớp trọng yếu. PT có thể tìm nhanh theo tên bài, nhóm cơ, xương khớp hoặc mục tiêu huấn luyện.</p>
          </div>

          <div className="library-toolbar">
            <input
              value={techniqueQuery}
              onChange={(e) => setTechniqueQuery(e.target.value)}
              placeholder="Tìm: vai, gối, hông, core, squat, phục hồi..."
            />
            <select value={techniqueCategory} onChange={(e) => setTechniqueCategory(e.target.value)}>
              {techniqueCategories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="library-stats">
            <strong>{filteredTechniques.length}</strong>
            <span>kỹ thuật đang hiển thị / tổng 150 kỹ thuật</span>
          </div>

          <div className="technique-table-wrap">
            <table className="technique-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kỹ thuật</th>
                  <th>Nhóm</th>
                  <th>Vùng cơ/xương/khớp</th>
                  <th>Mục tiêu</th>
                  <th>Cue huấn luyện</th>
                </tr>
              </thead>
              <tbody>
                {filteredTechniques.map((item) => (
                  <tr key={item.no}>
                    <td>{item.no}</td>
                    <td><b>{item.name}</b></td>
                    <td><span className="category-pill">{item.category}</span></td>
                    <td>{item.region}</td>
                    <td>{item.goal}</td>
                    <td>{item.cue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ai-section">
          <div className="section-heading compact">
            <span>AI Meal Lookup</span>
            <h2>Tra cứu thực đơn bằng AI</h2>
            <p>PT nhập mục tiêu và ràng buộc ăn uống. AI sẽ gợi ý thực đơn dễ áp dụng cho khách hàng. API key phải đặt ở server, không đặt trong App.jsx.</p>
          </div>

          <div className="ai-grid">
            <label>
              Mục tiêu khách hàng
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)} />
            </label>
            <label>
              Ràng buộc ăn uống
              <textarea value={diet} onChange={(e) => setDiet(e.target.value)} />
            </label>
          </div>

          <button className="primary-btn" onClick={handleGenerateMenu} disabled={loading}>
            {loading ? "Đang tra cứu AI..." : "Tạo thực đơn bằng AI"}
          </button>

          {menuResult && <pre className="ai-result">{menuResult}</pre>}
        </section>
      </section>
    </main>
  );
}

const css = `
:root {
  --red: #b31217;
  --red-dark: #7d080c;
  --black: #090909;
  --text: #171717;
  --muted: #666666;
  --line: #e8e8e8;
  --soft: #f7f7f7;
  --white: #ffffff;
  --shadow: 0 24px 70px rgba(0,0,0,0.08);
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--white); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
button, textarea { font: inherit; }

.academy-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 330px 1fr;
  background: linear-gradient(90deg, #fff 0%, #fff 58%, #fafafa 100%);
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 28px;
  border-right: 1px solid var(--line);
  background: #fff;
  overflow-y: auto;
}

.brand-block { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.brand-mark { width: 48px; height: 48px; display: grid; place-items: center; background: var(--black); color: #fff; border-radius: 14px; font-weight: 900; font-size: 22px; box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
.brand-block h1 { margin: 0; font-size: 26px; letter-spacing: -0.04em; }
.eyebrow, .tiny-title { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 11px; font-weight: 800; color: var(--muted); }
.red { color: var(--red); }

.sidebar-card { padding: 20px; border: 1px solid var(--line); border-radius: 24px; background: var(--soft); margin-bottom: 22px; }
.sidebar-card h2 { margin: 0 0 10px; font-size: 18px; letter-spacing: -0.02em; }
.sidebar-card p { margin: 0; color: var(--muted); line-height: 1.55; font-size: 14px; }

.module-nav { display: grid; gap: 10px; }
.nav-item { border: 1px solid var(--line); background: #fff; color: var(--text); text-align: left; padding: 14px; border-radius: 18px; cursor: pointer; transition: 0.18s ease; }
.nav-item span { display: block; font-weight: 800; font-size: 14px; }
.nav-item small { display: block; color: var(--muted); margin-top: 4px; }
.nav-item:hover { border-color: #111; transform: translateY(-1px); }
.nav-item.active { background: var(--black); color: #fff; border-color: var(--black); }
.nav-item.active small { color: #d7d7d7; }

.content { padding: 34px; max-width: 1380px; width: 100%; margin: 0 auto; }
.hero { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: stretch; margin-bottom: 24px; }
.hero > div:first-child { padding: 42px; border: 1px solid var(--line); border-radius: 34px; background: #fff; box-shadow: var(--shadow); }
.hero h2 { margin: 0; font-size: clamp(36px, 5vw, 72px); letter-spacing: -0.07em; line-height: 0.92; color: var(--black); }
.hero-copy { max-width: 760px; color: var(--muted); font-size: 17px; line-height: 1.7; margin: 24px 0 0; }
.hero-panel { border-radius: 34px; background: linear-gradient(145deg, var(--black), #2a0002); color: #fff; padding: 30px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 280px; box-shadow: var(--shadow); }
.hero-panel span { color: #eee; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
.hero-panel strong { font-size: 64px; letter-spacing: -0.07em; color: #fff; }
.hero-panel small { color: #ffb4b7; }

.grid-overview { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-bottom: 24px; }
.phase-card { border: 1px solid var(--line); background: #fff; border-radius: 22px; padding: 18px; min-height: 165px; }
.phase-card span { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
.phase-card h3 { margin: 10px 0; font-size: 16px; letter-spacing: -0.02em; }
.phase-card p { color: var(--muted); font-size: 13px; line-height: 1.5; min-height: 58px; }
.phase-card b { font-size: 13px; }

.lesson-section { display: grid; grid-template-columns: 1fr 330px; gap: 24px; }
.lesson-main, .ai-section { background: #fff; border: 1px solid var(--line); border-radius: 34px; padding: 30px; box-shadow: var(--shadow); }
.section-heading span { display: inline-flex; color: var(--red); background: #fff1f1; border: 1px solid #ffd4d4; padding: 7px 10px; border-radius: 999px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
.section-heading h2 { margin: 16px 0 12px; font-size: 34px; letter-spacing: -0.05em; color: var(--black); }
.section-heading p { margin: 0 0 22px; color: var(--muted); line-height: 1.75; }
.compact h2 { font-size: 30px; }

.point-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.point-card { border: 1px solid var(--line); border-radius: 24px; padding: 20px; background: #fff; }
.point-card h3 { margin: 0 0 10px; font-size: 18px; letter-spacing: -0.03em; }
.point-card p { margin: 0; color: var(--muted); line-height: 1.65; font-size: 14px; }
.cue { margin-top: 16px; padding: 12px; border-left: 4px solid var(--red); background: #fafafa; color: #222; font-size: 13px; line-height: 1.45; border-radius: 0 12px 12px 0; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; }
.info-box { border: 1px solid var(--line); border-radius: 24px; background: var(--soft); padding: 20px; }
.info-box.danger { background: #fff7f7; border-color: #ffdcdc; }
.info-box h3, .exercise-strip h3, .side-panel h3 { margin: 0 0 12px; letter-spacing: -0.03em; }
ul, ol { margin: 0; padding-left: 20px; color: var(--muted); line-height: 1.7; }

.exercise-strip { margin-top: 14px; padding: 20px; border-radius: 24px; border: 1px solid var(--line); }
.exercise-strip div { display: flex; flex-wrap: wrap; gap: 10px; }
.exercise-strip span { padding: 8px 12px; border: 1px solid var(--line); border-radius: 999px; background: #fff; font-size: 13px; font-weight: 700; }

.lesson-side { display: grid; gap: 18px; align-content: start; }
.side-panel { border: 1px solid var(--line); border-radius: 28px; background: #fff; padding: 24px; box-shadow: var(--shadow); }
.side-panel.black { background: var(--black); color: #fff; }
.side-panel.black p { color: #ddd; line-height: 1.7; }
.side-panel.black .tiny-title { color: #ffb4b7; }

.technique-library, .ai-section { margin-top: 24px; background: #fff; border: 1px solid var(--line); border-radius: 34px; padding: 30px; box-shadow: var(--shadow); }
.library-toolbar { display: grid; grid-template-columns: 1fr 240px; gap: 14px; margin: 18px 0; }
.library-toolbar input, .library-toolbar select { width: 100%; border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; outline: none; background: #fff; color: var(--text); }
.library-toolbar input:focus, .library-toolbar select:focus { border-color: var(--red); box-shadow: 0 0 0 4px rgba(179,18,23,0.08); }
.library-stats { display: inline-flex; align-items: baseline; gap: 8px; padding: 10px 14px; border: 1px solid #ffd4d4; border-radius: 999px; background: #fff7f7; margin-bottom: 16px; }
.library-stats strong { color: var(--red); font-size: 22px; }
.library-stats span { color: var(--muted); font-size: 13px; }
.technique-table-wrap { max-height: 620px; overflow: auto; border: 1px solid var(--line); border-radius: 24px; }
.technique-table { width: 100%; border-collapse: collapse; min-width: 980px; font-size: 14px; }
.technique-table th { position: sticky; top: 0; background: var(--black); color: #fff; text-align: left; padding: 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; z-index: 1; }
.technique-table td { padding: 14px; border-bottom: 1px solid var(--line); vertical-align: top; color: #333; line-height: 1.5; }
.technique-table tr:hover td { background: #fafafa; }
.category-pill { display: inline-flex; padding: 6px 9px; border-radius: 999px; background: #fff1f1; color: var(--red); font-weight: 900; font-size: 12px; }
.ai-section { margin-top: 24px; }
.ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ai-grid label { display: grid; gap: 8px; font-size: 13px; font-weight: 900; color: #111; text-transform: uppercase; letter-spacing: 0.06em; }
textarea { width: 100%; min-height: 120px; resize: vertical; border: 1px solid var(--line); border-radius: 20px; padding: 16px; outline: none; color: var(--text); background: #fff; line-height: 1.55; }
textarea:focus { border-color: var(--red); box-shadow: 0 0 0 4px rgba(179,18,23,0.08); }
.primary-btn { margin-top: 16px; border: 0; border-radius: 999px; padding: 14px 22px; background: var(--red); color: #fff; font-weight: 900; cursor: pointer; box-shadow: 0 16px 30px rgba(179,18,23,0.25); }
.primary-btn:hover { background: var(--red-dark); }
.primary-btn:disabled { opacity: 0.7; cursor: wait; }
.ai-result { white-space: pre-wrap; margin: 18px 0 0; padding: 22px; background: #101010; color: #fff; border-radius: 24px; line-height: 1.7; font-size: 14px; overflow: auto; }

@media (max-width: 1180px) {
  .academy-shell { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; }
  .grid-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lesson-section, .hero { grid-template-columns: 1fr; }
  .point-grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .content, .sidebar { padding: 18px; }
  .hero > div:first-child, .lesson-main, .ai-section { padding: 22px; border-radius: 26px; }
  .grid-overview, .two-col, .ai-grid, .library-toolbar { grid-template-columns: 1fr; }
  .hero h2 { font-size: 42px; }
}
`;

export default App;
