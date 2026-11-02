/* 문항·선택지·참고문헌. 모든 문항은 이 워크북을 위해 새로 작성됨(검증된 척도 아님). */
window.CONTENT = {
  freq5: ['전혀 아니다', '약간', '보통', '꽤', '매우 그렇다'],

  /* A. 증상 선별: DSM-5 사회불안장애 진단기준 A~G를 참고해 작성 */
  screenItems: [
    { id: 's1', crit: 'A', text: '남들이 나를 지켜보거나 평가할 수 있는 상황(처음 보는 사람과의 대화, 발표, 남 앞에서 먹거나 글씨 쓰기 등)에서 뚜렷한 불안이나 두려움을 느낀다.' },
    { id: 's2', crit: 'B', text: '그런 상황에서 불안한 티를 내거나 실수해서 창피를 당하거나, 거절당하거나, 남을 불편하게 할까 봐 걱정한다.' },
    { id: 's3', crit: 'C', text: '그런 상황은 거의 매번 불안을 불러일으킨다.' },
    { id: 's4', crit: 'D', text: '그런 상황을 피하거나, 피하지 못하면 강한 불안을 견디며 겨우 버틴다.' },
    { id: 's5', crit: 'E', text: '차분히 돌아보면, 내가 느끼는 불안은 그 상황의 실제 위험에 비해 지나치게 크다.' },
    { id: 's6', crit: 'G', text: '이 불안이나 회피 때문에 일·학업·인간관계·일상생활에 지장이 있다.' },
    { id: 's7', crit: 'G', text: '이 불안 때문에 스스로 많이 괴롭다.' },
  ],
  durationOpts: [
    { id: '<1m', label: '1개월 미만' },
    { id: '1-6m', label: '1~6개월' },
    { id: '6m+', label: '6개월 이상' },
  ],
  suicideOpts: ['없었다', '가끔 있었다', '자주 있었다'],

  situations: [
    { id: 'stranger', label: '처음 보는 사람과 대화하기' },
    { id: 'meeting', label: '회의·수업에서 발언하기' },
    { id: 'present', label: '여러 사람 앞에서 발표하기' },
    { id: 'eat', label: '남 앞에서 먹거나 마시기' },
    { id: 'phone', label: '전화 걸기·받기' },
    { id: 'authority', label: '상사·교수 등 윗사람과 대화하기' },
    { id: 'party', label: '모임·회식·파티' },
    { id: 'watched', label: '누가 지켜보는 가운데 일하거나 글씨 쓰기' },
    { id: 'assert', label: '거절하기·반대 의견 말하기' },
    { id: 'date', label: '데이트·호감 있는 사람과 대화' },
    { id: 'shop', label: '가게에서 문의·환불 요청하기' },
    { id: 'restroom', label: '공중화장실 이용하기' },
  ],

  /* B. 모델 요소 프로파일 */
  domains: {
    beliefs: {
      name: '부정적 사회적 신념', en: 'Assumptions & beliefs',
      subs: { std: '지나치게 높은 기준', cond: '조건적 신념', uncond: '무조건적 자기신념' },
      read: {
        low: '사회적 상황에 대한 극단적인 규칙이나 부정적 자기신념이 두드러지지 않습니다.',
        mid: '일부 상황에서 "이래야만 한다"는 기준이나 "이러면 거절당할 것"이라는 예측이 작동하는 편입니다. 실험(E4·E5)으로 검증해 볼 만한 신념을 고를 수 있습니다.',
        high: '높은 기준·조건적 신념·부정적 자기신념이 강하게 작동합니다. 이 신념들이 사회적 상황을 "위험"하게 만드는 출발점입니다. 하위 영역 중 가장 높은 것부터 실험으로 검증해 보세요.',
      },
    },
    focus: {
      name: '자기초점 주의와 자기 이미지', en: 'Self-focused attention',
      subs: { focus: '자기 감시', image: '관찰자 시점 이미지', felt: '느낌으로 추론' },
      read: {
        low: '불안할 때도 주의가 자기 내부로 크게 쏠리지 않는 편입니다.',
        mid: '불안할 때 주의가 자기 내부로 향하고, 느낌을 근거로 내 모습을 추론하는 경향이 있습니다. E1(비교 실험)과 E3(외부 주의 훈련)이 도움이 됩니다.',
        high: '불안할 때 자기 감시가 강하고, 남들 눈에 비친 내 모습을 부정적 이미지로 떠올리는 경향이 뚜렷합니다. 모델에서 핵심 유지 요인입니다. E2(비디오 피드백)로 이미지와 실제를 비교해 보세요.',
      },
    },
    safety: {
      name: '안전행동', en: 'Safety behaviours',
      subs: { avoid: '회피형', manage: '인상관리형' },
      read: {
        low: '안전행동 사용이 많지 않습니다.',
        mid: '몇 가지 안전행동을 습관적으로 사용합니다. 어떤 행동이 두려움을 "지켜 주고" 있는지 E1으로 확인해 보세요.',
        high: '안전행동을 폭넓게 사용합니다. 안전행동은 두려움이 틀렸다는 증거를 막고, 증상과 자기초점을 키우며, 상대에게 거리감을 줄 수 있습니다. 하나씩 내려놓는 실험(E1·E4)이 치료의 중심입니다.',
      },
    },
    processing: {
      name: '예기불안과 사후 곱씹기', en: 'Anticipatory & post-event processing',
      subs: { pre: '예기 처리', post: '사후 처리' },
      read: {
        low: '사회적 상황 전후의 반복적 걱정이나 곱씹기가 많지 않습니다.',
        mid: '상황 전후로 걱정하거나 곱씹는 일이 종종 있습니다. E6(곱씹기 점검)으로 곱씹기가 실제로 무엇을 남기는지 살펴보세요.',
        high: '상황 전에는 실패 장면을, 끝난 뒤에는 실수를 반복해서 떠올립니다. 곱씹기는 왜곡된 자기 이미지를 기억으로 굳혀 다음 상황을 더 두렵게 만듭니다. E6을 먼저 권합니다.',
      },
    },
  },
  profileItems: [
    { id: 'b1', domain: 'beliefs', sub: 'std', text: '사람들 앞에서는 절대 긴장한 티를 내면 안 된다.' },
    { id: 'b2', domain: 'beliefs', sub: 'std', text: '대화할 때는 항상 똑똑하거나 재미있는 말을 해야 한다.' },
    { id: 'b3', domain: 'beliefs', sub: 'std', text: '모든 사람이 나를 좋게 봐야 마음이 놓인다.' },
    { id: 'b4', domain: 'beliefs', sub: 'cond', text: '내가 말실수를 하면 사람들은 나를 무시할 것이다.' },
    { id: 'b5', domain: 'beliefs', sub: 'cond', text: '내가 조용히 있으면 사람들은 나를 지루하거나 이상한 사람으로 볼 것이다.' },
    { id: 'b6', domain: 'beliefs', sub: 'cond', text: '불안한 모습을 들키면 사람들이 나를 거절할 것이다.' },
    { id: 'b7', domain: 'beliefs', sub: 'uncond', text: '나는 다른 사람들과 다르다. 어딘가 이상하다.' },
    { id: 'b8', domain: 'beliefs', sub: 'uncond', text: '나는 호감 가지 않는 사람이다.' },
    { id: 'f1', domain: 'focus', sub: 'focus', text: '사람들과 있을 때 내 말투, 표정, 몸의 느낌을 계속 점검한다.' },
    { id: 'f2', domain: 'focus', sub: 'focus', text: '대화하다가 내 생각에 빠져 상대가 한 말을 놓친다.' },
    { id: 'f3', domain: 'focus', sub: 'image', text: '불안할 때 남들 눈에 비친 내 모습이 머릿속에 그림처럼 떠오른다.' },
    { id: 'f4', domain: 'focus', sub: 'image', text: '그때 떠오르는 내 모습은 실제보다 훨씬 어색하고 불안해 보인다.' },
    { id: 'f5', domain: 'focus', sub: 'felt', text: '내가 긴장을 느끼면 남들도 그걸 분명히 알아챌 것이다.' },
    { id: 'f6', domain: 'focus', sub: 'felt', text: '얼굴이 뜨겁게 느껴지면 남들 눈에도 새빨갛게 보일 것이다.' },
    { id: 'sb1', domain: 'safety', sub: 'avoid', text: '눈을 잘 마주치지 않는다.' },
    { id: 'sb2', domain: 'safety', sub: 'avoid', text: '말을 적게 하거나 나에 대한 이야기를 피한다.' },
    { id: 'sb3', domain: 'safety', sub: 'avoid', text: '구석이나 눈에 띄지 않는 자리를 고른다.' },
    { id: 'sb4', domain: 'safety', sub: 'avoid', text: '휴대폰을 보거나 바쁜 척을 한다.' },
    { id: 'sb5', domain: 'safety', sub: 'manage', text: '할 말을 미리 준비하거나 머릿속으로 연습한다.' },
    { id: 'sb6', domain: 'safety', sub: 'manage', text: '방금 한 말이 괜찮았는지 속으로 계속 확인한다.' },
    { id: 'sb7', domain: 'safety', sub: 'manage', text: '떨림이나 홍조를 숨기려고 손이나 얼굴을 가리거나 몸에 힘을 준다.' },
    { id: 'sb8', domain: 'safety', sub: 'manage', text: '어색함이 무서워 말을 빠르게 하거나 쉬지 않고 이야기한다.' },
    { id: 'p1', domain: 'processing', sub: 'pre', text: '사회적 상황을 앞두고 잘못될 장면을 반복해서 떠올린다.' },
    { id: 'p2', domain: 'processing', sub: 'pre', text: '걱정 때문에 약속이나 자리를 미루거나 취소하고 싶어진다.' },
    { id: 'p3', domain: 'processing', sub: 'post', text: '상황이 끝난 뒤 내가 한 실수나 어색했던 순간을 계속 곱씹는다.' },
    { id: 'p4', domain: 'processing', sub: 'post', text: '곱씹을수록 그때 내가 더 이상하게 보였던 것 같다.' },
  ],

  /* 사례개념화·실험 공용 선택지 */
  safetyList: [
    { id: 'eye', label: '눈 피하기', type: 'avoid', drop: '상대와 자연스럽게 눈을 맞춘다' },
    { id: 'quiet', label: '말 적게·작게 하기', type: 'avoid', drop: '평소보다 한두 문장 더, 또렷하게 말한다' },
    { id: 'hide', label: '구석·뒷자리 고르기', type: 'avoid', drop: '눈에 띄는 자리에 앉는다' },
    { id: 'phone', label: '휴대폰 보며 바쁜 척', type: 'avoid', drop: '휴대폰을 넣어 두고 대화에 참여한다' },
    { id: 'script', label: '할 말 미리 준비·연습', type: 'manage', drop: '준비 없이 떠오르는 대로 말한다' },
    { id: 'monitor', label: '방금 한 말 점검하기', type: 'manage', drop: '점검을 멈추고 상대의 말에 집중한다' },
    { id: 'cover', label: '얼굴·손 가리기, 몸에 힘주기', type: 'manage', drop: '손과 어깨를 편하게 두고, 가리지 않는다' },
    { id: 'rush', label: '빠르게·쉬지 않고 말하기', type: 'manage', drop: '천천히 말하고 침묵을 그대로 둔다' },
    { id: 'drink', label: '술이나 약에 기대기', type: 'manage', drop: '술·약 없이 참여한다' },
    { id: 'rehearse', label: '남의 말 대신 내 차례 준비', type: 'manage', drop: '내 차례를 준비하지 않고 듣는다' },
  ],
  symptomList: [
    { id: 'blush', label: '얼굴 붉어짐·화끈거림' },
    { id: 'heart', label: '심장 두근거림' },
    { id: 'tremble', label: '손·목소리 떨림' },
    { id: 'sweat', label: '땀' },
    { id: 'blank', label: '머리가 하얘짐' },
    { id: 'breath', label: '숨 막힘·가슴 답답' },
    { id: 'stiff', label: '몸이 굳음' },
    { id: 'speech', label: '말이 막히거나 꼬임' },
  ],

  /* E5 설문 주제 (Clark 치료에서 쓰는 설문 방식을 참고해 새로 작성) */
  surveyThemes: [
    { id: 'blush', label: '얼굴이 붉어지는 것', q: ['대화 중에 상대 얼굴이 붉어지는 걸 알아차린 적이 있나요?', '알아차렸다면, 그 사람에 대해 어떤 생각이 들었나요?', '그 사람을 덜 좋게 보게 되었나요?', '본인도 얼굴이 붉어진 적이 있나요?'] },
    { id: 'tremble', label: '손이나 목소리가 떨리는 것', q: ['발표나 대화 중에 누군가의 손이나 목소리가 떨리는 걸 알아차린 적이 있나요?', '알아차렸다면, 그 사람에 대해 어떤 생각이 들었나요?', '그 사람을 덜 좋게 보게 되었나요?', '본인도 떨린 적이 있나요?'] },
    { id: 'blank', label: '말이 막히거나 할 말을 잊는 것', q: ['대화 중에 누군가 말이 막히거나 할 말을 잊는 걸 본 적이 있나요?', '그때 그 사람에 대해 어떤 생각이 들었나요?', '그 사람을 덜 좋게 보게 되었나요?', '본인도 그런 적이 있나요?'] },
    { id: 'silence', label: '대화 중 침묵이 흐르는 것', q: ['대화 중 잠깐 침묵이 흐르면 누구 탓이라고 느끼나요?', '침묵 중에 말을 안 한 사람을 이상하게 보나요?', '그런 침묵을 얼마나 오래 기억하나요?', '본인도 침묵 때문에 불편했던 적이 있나요?'] },
    { id: 'nervous', label: '긴장한 티가 나는 것', q: ['누군가 긴장한 게 느껴질 때, 그 사람을 어떻게 생각하나요?', '그 사람을 덜 좋게 보게 되나요?', '오히려 친근하게 느낀 적이 있나요?', '본인도 긴장한 티가 난 적이 있나요?'] },
  ],

  refs: [
    'Clark, D. M., & Wells, A. (1995). A cognitive model of social phobia. In R. G. Heimberg, M. R. Liebowitz, D. A. Hope, & F. R. Schneier (Eds.), Social phobia: Diagnosis, assessment, and treatment (pp. 69–93). Guilford Press.',
    'Clark, D. M., et al. (2003). Cognitive therapy versus fluoxetine in generalized social phobia: A randomized placebo-controlled trial. Journal of Consulting and Clinical Psychology, 71(6), 1058–1067.',
    'Clark, D. M., et al. (2006). Cognitive therapy versus exposure and applied relaxation in social phobia: A randomized controlled trial. Journal of Consulting and Clinical Psychology, 74(3), 568–578.',
    'Stangier, U., et al. (2003). Cognitive therapy for social phobia: Individual versus group treatment. Behaviour Research and Therapy, 41(9), 991–1007.',
    'Wild, J., Hackmann, A., & Clark, D. M. (2008). Rescripting early memories linked to negative images in social phobia: A pilot study. Behavior Therapy, 39(1), 47–56.',
    'Mayo-Wilson, E., et al. (2014). Psychological and pharmacological interventions for social anxiety disorder in adults: A systematic review and network meta-analysis. The Lancet Psychiatry, 1(5), 368–376.',
    'National Institute for Health and Care Excellence (2013). Social anxiety disorder: Recognition, assessment and treatment (CG159).',
    'Clark, D. M., et al. (2022). More than doubling the clinical benefit of each hour of therapist time: A randomised controlled trial of internet cognitive therapy for social anxiety disorder. Psychological Medicine.',
  ],
};
