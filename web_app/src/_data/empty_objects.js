const newPerson = {
                name: null,
                surname1: null,
                surname2: null,
                email: null,
                address: null,
                city: null,
                zip: null,
                dni: null,
                phone: null,
                gender: null,

                country_of_origin: null,
                is_studying: null,
                education_entity: null,
                education_year: null,
                is_working: null,
                career: null
              };
export const emptyGuardian = {...newPerson, relation: null};
export const emptyAttendee = {...newPerson,
    price_term: null,
    payment_comments: null,
    birth_date: null,
    other_comments: null,
    image_agreement: null,
    enrolment_status: null,
    default_payment_method: null
};
