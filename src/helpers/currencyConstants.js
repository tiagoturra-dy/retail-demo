import { US, GB, EU, CL, BR } from 'country-flag-icons/react/3x2'

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "US", langLabel: 'English US', lang: "en-US", flag: <US title='US Flag' style={{ display: 'inline-block', width: '24px', height: '24px' }} /> },
  { value: "GBP", label: "UK", langLabel: 'English UK', lang: "en-GB", flag: <GB title='UK Flag' style={{ display: 'inline-block', width: '24px', height: '24px' }} /> },
  { value: "EUR", label: "EU", langLabel: 'English EU', lang: "en-EU", flag: <EU title='EU Flag' style={{ display: 'inline-block', width: '24px', height: '24px' }} /> },
  { value: "CLP", label: "Chile", langLabel: 'Spanish CL', lang: "es-CL", flag: <CL title='CL Flag' style={{ display: 'inline-block', width: '24px', height: '24px' }} /> },
  { value: "BRL", label: "Brazil", langLabel: 'Portuguese BR', lang: "pt-BR", flag: <BR title='BR Flag' style={{ display: 'inline-block', width: '24px', height: '24px' }} /> }
];
