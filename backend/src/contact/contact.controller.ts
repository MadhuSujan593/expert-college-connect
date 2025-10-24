import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { SubmitContactFormDto } from './dto/submit-contact-form.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() contactData: SubmitContactFormDto) {
    return await this.contactService.submitContactForm(contactData);
  }
}
