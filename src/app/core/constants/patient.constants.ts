import { Gender } from '../models/enums/gender.enum';
import { BloodGroup } from '../models/enums/blood-group.enum';
import { Relationship } from '../models/enums/relationship.enum';

export const GENDER_OPTIONS = [
    { label: 'Male', value: Gender.MALE },
    { label: 'Female', value: Gender.FEMALE },
    { label: 'Other', value: Gender.OTHER },
    { label: 'Children', value: 'Children' },
];

export const BLOOD_GROUP_OPTIONS = [
    { label: 'A+', value: BloodGroup.A_POSITIVE },
    { label: 'A-', value: BloodGroup.A_NEGATIVE },
    { label: 'B+', value: BloodGroup.B_POSITIVE },
    { label: 'B-', value: BloodGroup.B_NEGATIVE },
    { label: 'AB+', value: BloodGroup.AB_POSITIVE },
    { label: 'AB-', value: BloodGroup.AB_NEGATIVE },
    { label: 'O+', value: BloodGroup.O_POSITIVE },
    { label: 'O-', value: BloodGroup.O_NEGATIVE },
];

export const RELATIONSHIP_OPTIONS = [
    { label: 'Spouse', value: Relationship.SPOUSE },
    { label: 'Parent', value: Relationship.PARENT },
    { label: 'Sibling', value: Relationship.SIBLING },
    { label: 'Child', value: Relationship.CHILD },
    { label: 'Other', value: Relationship.OTHER },
];
