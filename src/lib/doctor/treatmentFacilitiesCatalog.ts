/**
 * Fallback when clinic-provider `GET /treatment-facilities` is unavailable.
 * Canonical catalog + DisplayName live in denti-code-clinic-provider-api (seeded).
 * IDs are stored on performed actions as JSON; UI labels use i18n then API DisplayName.
 */
export type TreatmentFacilityGroup = {
  groupKey: string;
  ids: readonly string[];
};

export const TREATMENT_FACILITY_GROUPS: readonly TreatmentFacilityGroup[] = [
  {
    groupKey: 'doctor.facilitiesCatalog.groups.anesthesia',
    ids: [
      'articaine_4pct',
      'lidocaine_2pct',
      'mepivacaine_3pct',
      'bupivacaine_05',
      'topical_benzocaine',
      'nitrous_oxide_delivery',
    ],
  },
  {
    groupKey: 'doctor.facilitiesCatalog.groups.ppe',
    ids: [
      'latex_gloves',
      'nitrile_gloves',
      'surgical_mask',
      'protective_eyewear',
      'face_shield',
      'patient_bib',
    ],
  },
  {
    groupKey: 'doctor.facilitiesCatalog.groups.isolation',
    ids: [
      'high_volume_evacuation',
      'saliva_ejector',
      'suction_tips',
      'rubber_dam_kit',
      'cotton_rolls',
      'gauze_2x2',
    ],
  },
  {
    groupKey: 'doctor.facilitiesCatalog.groups.power_equipment',
    ids: [
      'handpiece_highspeed',
      'handpiece_slowspeed',
      'ultrasonic_scaler',
      'prophy_angle',
      'air_water_syringe',
      'curing_light_led',
    ],
  },
  {
    groupKey: 'doctor.facilitiesCatalog.groups.hand_instruments',
    ids: ['mouth_mirror', 'explorer_probe', 'periodontal_probe', 'college_pliers'],
  },
  {
    groupKey: 'doctor.facilitiesCatalog.groups.imaging',
    ids: ['digital_sensor', 'lead_apron_thyroid_collar', 'phosphor_plates'],
  },
  {
    groupKey: 'doctor.facilitiesCatalog.groups.restorative',
    ids: [
      'fluoride_varnish',
      'etchant_syringe',
      'bonding_agent',
      'composite_compules',
      'articulating_paper',
    ],
  },
] as const;

export const ANESTHESIA_QUICK_KEYS = [
  'none',
  'topical',
  'articaine_buccal',
  'lidocaine_block',
  'nitrous',
] as const;

export type AnesthesiaQuickKey = (typeof ANESTHESIA_QUICK_KEYS)[number];
