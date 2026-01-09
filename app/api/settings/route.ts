import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, study_group, denomination')
      .eq('id', user.id)
      .single();

    // Return defaults if no settings found
    const defaultSettings = {
      bible_version: 'NIV',
      email_notifications: true,
      calendar_reminders: true,
      community_notifications: true,
      font_size: 'medium',
    };

    // Use email username as fallback for display name
    const emailName = user.email?.split('@')[0] || '';
    const defaultProfile = {
      username: emailName,
      full_name: emailName,
      study_group: '',
      denomination: '',
    };

    return NextResponse.json({
      settings: settings || defaultSettings,
      profile: profile || defaultProfile,
      email: user.email || ''
    });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings, profile } = body;

    // IMPORTANT: Ensure profile exists first (user_settings has FK to profiles)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile first - required for user_settings FK constraint
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: profile?.username || user.email?.split('@')[0] || 'user',
          full_name: profile?.full_name || user.email?.split('@')[0] || 'User',
          study_group: profile?.study_group || '',
          denomination: profile?.denomination || '',
        });

      if (createProfileError) {
        console.error('Profile create error:', createProfileError);
        throw createProfileError;
      }
    } else if (profile) {
      // Update existing profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          full_name: profile.full_name,
          study_group: profile.study_group,
          denomination: profile.denomination,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
    }

    // Now handle settings (profile exists, FK constraint satisfied)
    if (settings) {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingSettings) {
        // Update existing settings
        const { error: settingsError } = await supabase
          .from('user_settings')
          .update({
            bible_version: settings.bible_version,
            email_notifications: settings.email_notifications,
            calendar_reminders: settings.calendar_reminders,
            community_notifications: settings.community_notifications,
            font_size: settings.font_size,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (settingsError) {
          console.error('Settings update error:', settingsError);
          throw settingsError;
        }
      } else {
        // Insert new settings
        const { error: settingsError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            bible_version: settings.bible_version,
            email_notifications: settings.email_notifications,
            calendar_reminders: settings.calendar_reminders,
            community_notifications: settings.community_notifications,
            font_size: settings.font_size,
          });

        if (settingsError) {
          console.error('Settings insert error:', settingsError);
          throw settingsError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
