import InvoiceComponent from './component';
import MainLogo from '@/assets/auth_logo.png'
import Logo01 from '@/assets/logos-01.png'
import Logo02 from '@/assets/logos-02.png'
import Logo03 from '@/assets/logos-03.png'
import Logo04 from '@/assets/logos-04.png'


const InvoicePage = () => {
    const invoiceData = {
        logo: MainLogo.src,
        client: {
          name: "Client’s Name",
          phone: '123-456-7890',
          email: 'hello@reallygreatsite.com',
          address: '123 Anywhere St., Any City'
        },
        invoiceNumber: '12345',
        invoiceDate: '25 June 2022',
        items: [
          { no: 1, description: 'Logo Design', qty: 5, price: '$100', total: '$500' },
          { no: 2, description: 'Website Design', qty: 2, price: '$800', total: '$1600' },
          { no: 3, description: 'Brand Design', qty: 3, price: '$300', total: '$900' },
          { no: 4, description: 'Banner Design', qty: 2, price: '$300', total: '$600' },
          { no: 5, description: 'Flyer Design', qty: 2, price: '$400', total: '$800' },
          { no: 6, description: 'Social Media Template', qty: 10, price: '$50', total: '$500' },
          { no: 7, description: 'Name Card', qty: 15, price: '$25', total: '$750' },
          { no: 8, description: 'Web Developer', qty: 2, price: '$1000', total: '$2000' },
          { no: 1, description: 'Logo Design', qty: 5, price: '$100', total: '$500' },
          { no: 2, description: 'Website Design', qty: 2, price: '$800', total: '$1600' },
          { no: 3, description: 'Brand Design', qty: 3, price: '$300', total: '$900' },
          { no: 4, description: 'Banner Design', qty: 2, price: '$300', total: '$600' },
          { no: 5, description: 'Flyer Design', qty: 2, price: '$400', total: '$800' },
          { no: 6, description: 'Social Media Template', qty: 10, price: '$50', total: '$500' },
          { no: 7, description: 'Name Card', qty: 15, price: '$25', total: '$750' },
          { no: 8, description: 'Web Developer', qty: 2, price: '$1000', total: '$2000' },
          { no: 1, description: 'Logo Design', qty: 5, price: '$100', total: '$500' },
          { no: 2, description: 'Website Design', qty: 2, price: '$800', total: '$1600' },
          { no: 3, description: 'Brand Design', qty: 3, price: '$300', total: '$900' },
          { no: 4, description: 'Banner Design', qty: 2, price: '$300', total: '$600' },
          { no: 5, description: 'Flyer Design', qty: 2, price: '$400', total: '$800' },
          { no: 6, description: 'Social Media Template', qty: 10, price: '$50', total: '$500' },
          { no: 7, description: 'Name Card', qty: 15, price: '$25', total: '$750' },
          { no: 8, description: 'Web Developer', qty: 2, price: '$1000', total: '$2000' },
          { no: 1, description: 'Logo Design', qty: 5, price: '$100', total: '$500' },
          { no: 2, description: 'Website Design', qty: 2, price: '$800', total: '$1600' },
          { no: 3, description: 'Brand Design', qty: 3, price: '$300', total: '$900' },
          { no: 4, description: 'Banner Design', qty: 2, price: '$300', total: '$600' },
          { no: 5, description: 'Flyer Design', qty: 2, price: '$400', total: '$800' },
          { no: 6, description: 'Social Media Template', qty: 10, price: '$50', total: '$500' },
          { no: 7, description: 'Name Card', qty: 15, price: '$25', total: '$750' },
          { no: 8, description: 'Web Developer', qty: 2, price: '$1000', total: '$2000' },
        ],
        projectId: '12345',
        projectDetails: 'Project Details & Work',
        bankName: 'Borcelle',
        accountNumber: '123-456-7890',
        termsAndConditions: 'Please send payment within 30 days of receiving this invoice. There will be a 10% interest charge per month on late invoices.',
        companyDetails: 'www.mkcontracts.com | +44 (0) 208 518 2100 | 50 Bunting Bridge, Newbury Park, Essex, IG2 7LR',
        footerLogos: [
          Logo01.src,
          Logo02.src,
          Logo03.src,
          Logo04.src,

        ]
      };

  return (
    <div>
      <InvoiceComponent invoiceData={invoiceData} />
    </div>
  );
};

export default InvoicePage;
